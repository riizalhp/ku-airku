# New Route Planning Flow - Create Routes Without Driver/Vehicle Assignment

## 🔄 Overview

System sekarang mendukung pembuatan rute TANPA harus mengassign driver dan armada terlebih dahulu. Driver dan armada bisa di-assign nanti sebelum rute diberangkatkan.

## 📋 Database Changes

### 1. Run Migration

Jalankan SQL migration di phpMyAdmin atau MySQL client:

```bash
# Lokasi file
d:\ku-airku\amdk-airku-backend\migrations\allow_null_driver_vehicle_in_routes.sql
```

**Migration Content:**

- Ubah `driverId` dan `vehicleId` di tabel `route_plans` menjadi NULLABLE
- Tambah column `assignmentStatus` dengan nilai: 'unassigned', 'assigned', 'departed', 'completed'
- Update existing routes ke status 'assigned'
- Tambah indexes untuk performance

### 2. Add Function to routeModel.js

Tambahkan fungsi berikut di file `d:\ku-airku\amdk-airku-backend\src\models\routeModel.js` SEBELUM `module.exports`:

```javascript
const assignDriverVehicle = async (routeId, driverId, vehicleId) => {
  try {
    const [result] = await pool.query(
      `UPDATE route_plans 
       SET driverId = ?, vehicleId = ?, assignmentStatus = 'assigned' 
       WHERE id = ?`,
      [driverId, vehicleId, routeId]
    );

    // Update assigned vehicle in orders
    await pool.query(
      `UPDATE orders o
       INNER JOIN route_stops rs ON o.id = rs.orderId
       SET o.assignedVehicleId = ?
       WHERE rs.routePlanId = ?`,
      [vehicleId, routeId]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error assigning driver/vehicle to route:", error);
    throw error;
  }
};
```

Dan update `module.exports` menjadi:

```javascript
module.exports = {
  createPlan,
  deletePendingPlansForVehicle,
  getAll,
  getById,
  updateStopStatus,
  deletePlan,
  moveOrder,
  assignDriverVehicle, // <-- TAMBAHKAN INI
};
```

## 🎯 New Flow

### Flow Lama (Sebelum):

```
1. Pilih Tanggal
2. Pilih Armada + Driver (WAJIB)
3. Buat Rute
4. Berangkatkan
```

### Flow Baru (Sekarang):

```
1. Pilih Tanggal
2. Buat Rute (TANPA driver/armada)
3. Assign Driver + Armada (sebelum berangkat)
4. Berangkatkan
```

## 🔧 API Changes

### 1. Create Route (Modified)

**Endpoint:** `POST /api/routes/plan`

**Request Body - Option A (With Assignment):**

```json
{
  "deliveryDate": "2025-10-28",
  "assignments": [
    {
      "vehicleId": "uuid-vehicle-1",
      "driverId": "uuid-driver-1"
    }
  ]
}
```

**Request Body - Option B (Without Assignment - NEW):**

```json
{
  "deliveryDate": "2025-10-28"
}
```

**Response (Unassigned Route):**

```json
{
  "success": true,
  "message": "Berhasil membuat 3 rute tanpa assignment. Silakan assign driver dan armada sebelum berangkat.",
  "routes": [
    {
      "id": "route-uuid-1",
      "driverId": null,
      "vehicleId": null,
      "date": "2025-10-28",
      "assignmentStatus": "unassigned",
      "stops": [...]
    }
  ]
}
```

### 2. Assign Driver & Vehicle (NEW)

**Endpoint:** `PUT /api/routes/:routeId/assign`

**Request Body:**

```json
{
  "driverId": "uuid-driver-1",
  "vehicleId": "uuid-vehicle-1"
}
```

**Response:**

```json
{
  "message": "Berhasil assign Budi Santoso dan B 1234 XYZ ke rute.",
  "route": {
    "id": "route-uuid-1",
    "driverId": "uuid-driver-1",
    "vehicleId": "uuid-vehicle-1",
    "assignmentStatus": "assigned",
    ...
  }
}
```

## 📊 Assignment Status

| Status       | Description                      | Can Depart |
| ------------ | -------------------------------- | ---------- |
| `unassigned` | Rute dibuat tanpa driver/vehicle | ❌ No      |
| `assigned`   | Driver & vehicle sudah di-assign | ✅ Yes     |
| `departed`   | Armada sudah berangkat           | -          |
| `completed`  | Rute selesai                     | -          |

## 🎨 Frontend Changes (To Be Implemented)

### RoutePlanning.tsx Updates Needed:

1. **Modal Form - Make Optional:**

```tsx
// Before
const canSubmit =
  deliveryForm.date && deliveryForm.vehicleId && deliveryForm.driverId;

// After
const canSubmit = deliveryForm.date; // Only date required
```

2. **Display Unassigned Routes:**

```tsx
{
  route.assignmentStatus === "unassigned" && (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
      <p className="text-sm text-yellow-700">
        ⚠️ Rute belum di-assign driver dan armada
      </p>
      <button
        onClick={() => openAssignModal(route.id)}
        className="mt-2 text-sm bg-yellow-600 text-white px-3 py-1 rounded"
      >
        Assign Driver & Armada
      </button>
    </div>
  );
}
```

3. **Add Assign Modal:**

```tsx
const [assignForm, setAssignForm] = useState({
  routeId: "",
  driverId: "",
  vehicleId: "",
});

const handleAssign = () => {
  assignDriverVehicleMutation.mutate(assignForm);
};
```

## 🧪 Testing Scenario

### Test Case 1: Create Unassigned Route

```
1. Login as Admin
2. Go to Route Planning
3. Click "Buat Rencana"
4. Select date: 2025-10-28
5. Leave driver/vehicle empty
6. Submit
7. Expected: Routes created with assignmentStatus='unassigned'
```

### Test Case 2: Assign Driver/Vehicle

```
1. Open unassigned route
2. Click "Assign Driver & Armada"
3. Select driver: Budi
4. Select vehicle: B 1234 XYZ
5. Submit
6. Expected: Route updated with driver/vehicle, status='assigned'
```

### Test Case 3: Create With Assignment (Old Flow)

```
1. Login as Admin
2. Go to Route Planning
3. Select date + driver + vehicle
4. Submit
5. Expected: Routes created with assignmentStatus='assigned'
```

## ⚙️ Backend Implementation Status

✅ **Completed:**

- Migration file created
- routeController.js updated with:
  - `createUnassignedRoutes()` helper
  - `createAssignedRoutes()` helper
  - `assignDriverVehicle()` endpoint
- routes.js updated with new endpoint
- routeModel.js `createPlan()` updated for nullable driver/vehicle
- types.ts updated with assignmentStatus

⏳ **Pending Manual Steps:**

1. Run migration SQL
2. Add `assignDriverVehicle()` function to routeModel.js
3. Update frontend RoutePlanning.tsx component

## 📝 Benefits

1. **Flexibility:** Buat rute dulu, pikirkan assignment nanti
2. **Planning:** Admin bisa planning rute untuk beberapa hari ke depan
3. **Resource Management:** Assign driver/vehicle sesuai availability saat itu
4. **Scalability:** Lebih mudah manage banyak rute sekaligus

## 🚨 Important Notes

- Rute dengan status 'unassigned' TIDAK BISA diberangkatkan
- Harus assign driver & vehicle dulu sebelum departure
- Validasi: vehicle harus 'Idle' saat di-assign
- Orders tetap berubah status ke 'Routed' meskipun belum assigned

---

**Created:** 27 Oktober 2025  
**Status:** ✅ Backend Ready, ⏳ Frontend Pending  
**Developer:** KU AIRKU Dev Team
