# 🎨 Frontend Update Summary - New Route Planning Flow

## 📅 Tanggal: 27 Oktober 2025

---

## 🎯 Tujuan Update

Mengubah tampilan frontend **Route Planning** agar sesuai dengan flow baru:

1. **Buat Rute** (tanpa driver & vehicle)
2. **Assign Driver & Armada** (sebelum berangkat)
3. **Berangkatkan** (ubah status ke "departed")

---

## 📂 File yang Diubah

### **1. `RoutePlanning.tsx`** ✅

**Path:** `d:\ku-airku\amdk-airku-frontend\src\components\admin\RoutePlanning.tsx`

**Perubahan Major:**

#### **A. State Management Baru**

```typescript
// State baru untuk assignment modal
const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
const [selectedRouteForAssignment, setSelectedRouteForAssignment] =
  useState<RoutePlan | null>(null);

// Form untuk delivery - HANYA tanggal (tidak ada driver/vehicle lagi)
const [deliveryForm, setDeliveryForm] = useState({
  date: new Date().toISOString().split("T")[0],
});

// Form terpisah untuk assignment
const [assignmentForm, setAssignmentForm] = useState({
  vehicleId: "",
  driverId: "",
});
```

#### **B. Mutation Baru - Assign Driver & Vehicle**

```typescript
const assignDriverVehicleMutation = useMutation({
  mutationFn: assignDriverVehicle, // Dari routeApiService
  onSuccess: (data) => {
    alert(data.message || "Driver dan armada berhasil di-assign!");
    queryClient.invalidateQueries({ queryKey: ["deliveryRoutes"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    // Close modal dan reset form
  },
  onError: (err: any) =>
    setModalError(
      err.response?.data?.message || "Gagal meng-assign driver dan armada."
    ),
});
```

#### **C. Handler Functions**

```typescript
// Buat rute TANPA driver/vehicle
const handleCreateDeliveryPlan = () => {
  createDeliveryMutation.mutate({
    deliveryDate: deliveryForm.date,
    assignments: [], // ← EMPTY! No driver/vehicle
  });
};

// Open modal untuk assign driver/vehicle
const handleOpenAssignModal = (route: RoutePlan) => {
  setSelectedRouteForAssignment(route);
  setAssignmentForm({ vehicleId: "", driverId: "" });
  setIsAssignModalOpen(true);
};

// Assign driver & vehicle ke rute
const handleAssignDriverVehicle = () => {
  assignDriverVehicleMutation.mutate({
    routeId: selectedRouteForAssignment.id,
    vehicleId: assignmentForm.vehicleId,
    driverId: assignmentForm.driverId,
  });
};
```

#### **D. Data Grouping - By Assignment Status**

```typescript
// Group routes berdasarkan assignmentStatus
const routesByStatus = useMemo(() => {
  const grouped: Record<string, RoutePlan[]> = {
    unassigned: [], // Belum ada driver/vehicle
    assigned: [], // Sudah ada driver/vehicle, siap berangkat
    departed: [], // Sudah berangkat
    completed: [], // Selesai
  };

  deliveryRoutes.forEach((route) => {
    const status = route.assignmentStatus || "unassigned";
    if (grouped[status]) {
      grouped[status].push(route);
    }
  });

  return grouped;
}, [deliveryRoutes]);
```

#### **E. Badge Helper Function**

```typescript
const getAssignmentStatusBadge = (status: string) => {
  const badges = {
    unassigned: {
      text: "Belum Di-assign",
      class: "bg-yellow-100 text-yellow-800",
    },
    assigned: { text: "Sudah Di-assign", class: "bg-blue-100 text-blue-800" },
    departed: { text: "Sudah Berangkat", class: "bg-green-100 text-green-800" },
    completed: { text: "Selesai", class: "bg-gray-100 text-gray-800" },
  };
  return badges[status as keyof typeof badges] || badges.unassigned;
};
```

#### **F. UI/UX Update**

**Before (Old Flow):**

```
┌─────────────────────────────────┐
│ Buat Rencana                    │
│ ├─ Tanggal                      │
│ ├─ Pilih Armada (WAJIB)         │ ← Harus pilih dulu
│ ├─ Pilih Driver (WAJIB)         │ ← Harus pilih dulu
│ └─ [Hasilkan Rute]              │
└─────────────────────────────────┘
```

**After (New Flow):**

```
┌─────────────────────────────────┐
│ Buat Rute Baru                  │
│ ├─ Tanggal                      │
│ └─ [Buat Rute] ← Langsung buat! │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Rute Belum Di-assign            │ ← Section baru
│ ├─ Rute 1 (5 pemberhentian)    │
│ │  └─ [Assign Driver & Armada] │ ← Button baru
│ ├─ Rute 2 (3 pemberhentian)    │
│ │  └─ [Assign Driver & Armada] │
│ └─────────────────────────────  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Rute Sudah Di-assign            │ ← Section baru
│ ├─ Rute 1 (Driver: John)       │
│ │  ├─ Armada: B1234AB          │
│ │  └─ [🚚 Berangkatkan]         │ ← Button baru
│ └─────────────────────────────  │
└─────────────────────────────────┘
```

---

### **2. `routeApiService.ts`** ✅

**Path:** `d:\ku-airku\amdk-airku-frontend\src\services\routeApiService.ts`

**Fungsi Baru:**

```typescript
export const assignDriverVehicle = async (payload: {
  routeId: string;
  vehicleId: string;
  driverId: string;
}): Promise<{ success: boolean; message: string }> => {
  const response = await api.put(`/routes/plan/${payload.routeId}/assign`, {
    vehicleId: payload.vehicleId,
    driverId: payload.driverId,
  });
  return response.data;
};
```

**Import Update di RoutePlanning.tsx:**

```typescript
import {
  createDeliveryRoute,
  getDeliveryRoutes,
  deleteDeliveryRoute,
  assignDriverVehicle, // ← NEW
  createSalesRoute,
  getSalesRoutes,
  deleteSalesRoute,
} from "../../services/routeApiService";
```

---

## 🎨 UI Components Baru

### **1. Info Banner - Flow Explanation**

```tsx
<Card className="bg-blue-50 border border-blue-200">
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 text-brand-primary pt-1">
      <ICONS.mapPin />
    </div>
    <div>
      <h3 className="text-md font-bold text-brand-dark">
        Flow Perencanaan Rute Baru
      </h3>
      <ol className="text-sm text-gray-700 mt-2 ml-4 list-decimal space-y-1">
        <li>
          <strong>Buat Rute</strong> - Sistem akan membuat rute optimal dari
          pesanan pending
        </li>
        <li>
          <strong>Assign Driver & Armada</strong> - Pilih driver dan kendaraan
          untuk rute
        </li>
        <li>
          <strong>Berangkatkan</strong> - Ubah status menjadi "Sudah Berangkat"
        </li>
      </ol>
    </div>
  </div>
</Card>
```

### **2. Unassigned Routes Section**

```tsx
{
  routesByStatus.unassigned.length > 0 && (
    <div>
      <h3 className="text-xl font-bold pb-2 mb-4 border-b flex items-center gap-2">
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
          {routesByStatus.unassigned.length}
        </span>
        Rute Belum Di-assign
      </h3>
      {/* Card untuk setiap rute unassigned */}
      <Card className="border-l-4 border-yellow-500">
        {/* Route details */}
        <button onClick={() => handleOpenAssignModal(route)}>
          Assign Driver & Armada
        </button>
      </Card>
    </div>
  );
}
```

### **3. Assigned Routes Section**

```tsx
{
  routesByStatus.assigned.length > 0 && (
    <div>
      <h3 className="text-xl font-bold pb-2 mb-4 border-b flex items-center gap-2">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          {routesByStatus.assigned.length}
        </span>
        Rute Sudah Di-assign (Siap Berangkat)
      </h3>
      <Card className="border-l-4 border-blue-500">
        {/* Show driver & vehicle info */}
        <button className="bg-green-600 text-white ...">🚚 Berangkatkan</button>
      </Card>
    </div>
  );
}
```

### **4. Assignment Modal**

```tsx
<Modal title="Assign Driver & Armada" isOpen={isAssignModalOpen} ...>
    {/* Route info card */}
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
        <p><strong>Rute:</strong> {date}</p>
        <p><strong>Wilayah:</strong> {region}</p>
        <p><strong>Total Pemberhentian:</strong> {stops.length}</p>
    </div>

    {/* Vehicle selection */}
    <select value={assignmentForm.vehicleId} ...>
        {vehicles.filter(v => v.status === VehicleStatus.IDLE).map(v => (
            <option value={v.id}>
                {v.plateNumber} - {v.model} (Kapasitas: {v.capacity})
            </option>
        ))}
    </select>

    {/* Driver selection */}
    <select value={assignmentForm.driverId} ...>
        {availableDrivers.map(d => (
            <option value={d.id}>{d.name}</option>
        ))}
    </select>

    {/* Submit button */}
    <button onClick={handleAssignDriverVehicle} disabled={!vehicleId || !driverId}>
        Assign
    </button>
</Modal>
```

---

## 🔄 Data Flow Baru

### **Step 1: Create Unassigned Route**

```
User Input:
  └─ Tanggal: 2025-10-28

Frontend (RoutePlanning.tsx):
  └─ handleCreateDeliveryPlan()
      └─ createDeliveryMutation.mutate({
            deliveryDate: '2025-10-28',
            assignments: []  // ← EMPTY
         })

API Call:
  └─ POST /api/routes/plan
      Body: { deliveryDate: '2025-10-28', assignments: [] }

Backend (routeController.js):
  └─ createUnassignedRoutes()
      ├─ Get pending orders for date
      ├─ Group by region
      ├─ Calculate optimal routes
      └─ INSERT route_plans with:
          ├─ driverId: NULL
          ├─ vehicleId: NULL
          └─ assignmentStatus: 'unassigned'

Response:
  └─ { success: true, message: "3 rute berhasil dibuat", routes: [...] }

Frontend Update:
  └─ Tampilkan di section "Rute Belum Di-assign"
```

### **Step 2: Assign Driver & Vehicle**

```
User Action:
  └─ Klik "Assign Driver & Armada" pada rute tertentu

Frontend:
  └─ handleOpenAssignModal(route)
      └─ Open modal dengan form:
          ├─ Select Vehicle (filter: status = IDLE)
          └─ Select Driver

User Input:
  ├─ Vehicle: B1234AB
  └─ Driver: John Doe

Frontend:
  └─ handleAssignDriverVehicle()
      └─ assignDriverVehicleMutation.mutate({
            routeId: 'route-123',
            vehicleId: 'vehicle-456',
            driverId: 'driver-789'
         })

API Call:
  └─ PUT /api/routes/plan/:routeId/assign
      Body: { vehicleId: 'vehicle-456', driverId: 'driver-789' }

Backend (routeController.js):
  └─ assignDriverVehicle()
      ├─ Validate vehicle status (must be IDLE)
      ├─ UPDATE route_plans SET:
      │   ├─ driverId = 'driver-789'
      │   ├─ vehicleId = 'vehicle-456'
      │   └─ assignmentStatus = 'assigned'
      ├─ UPDATE orders SET assignedVehicleId = 'vehicle-456'
      └─ UPDATE vehicles SET status = 'DELIVERING'

Response:
  └─ { success: true, message: "Driver dan armada berhasil di-assign" }

Frontend Update:
  └─ Pindah dari "Belum Di-assign" ke "Sudah Di-assign"
```

### **Step 3: Berangkatkan (TODO)**

```
User Action:
  └─ Klik "🚚 Berangkatkan" pada rute assigned

Frontend (Future Implementation):
  └─ handleDepartRoute(routeId)
      └─ departRouteMutation.mutate(routeId)

API Call:
  └─ PUT /api/routes/plan/:routeId/depart

Backend:
  └─ UPDATE route_plans SET assignmentStatus = 'departed'

Frontend Update:
  └─ Pindah dari "Sudah Di-assign" ke "Riwayat Perjalanan"
```

---

## 🎨 Visual Changes Summary

### **Color Coding (Status Badges)**

| Status       | Badge Color | Text            |
| ------------ | ----------- | --------------- |
| `unassigned` | 🟡 Yellow   | Belum Di-assign |
| `assigned`   | 🔵 Blue     | Sudah Di-assign |
| `departed`   | 🟢 Green    | Sudah Berangkat |
| `completed`  | ⚪ Gray     | Selesai         |

### **Border Indicators**

```css
Unassigned Routes:  border-l-4 border-yellow-500
Assigned Routes:    border-l-4 border-blue-500
```

### **Button States**

```
Unassigned Route:
  ├─ [Assign Driver & Armada]  (bg-brand-primary)
  └─ [Hapus Rute]              (bg-red-100)

Assigned Route:
  ├─ [🚚 Berangkatkan]         (bg-green-600)
  └─ [Batalkan]                (bg-red-100)
```

---

## ✅ Checklist Implementasi

### **Backend (Sudah Selesai)** ✅

- ✅ Migration SQL (allow NULL driver/vehicle, add assignmentStatus)
- ✅ routeController.js refactored
- ✅ routeModel.js updated
- ✅ Endpoint baru: PUT /api/routes/plan/:routeId/assign
- ✅ types.ts updated

### **Frontend (Baru Selesai)** ✅

- ✅ RoutePlanning.tsx - Complete UI overhaul
- ✅ routeApiService.ts - assignDriverVehicle function
- ✅ Modal for assignment
- ✅ Grouping by assignmentStatus
- ✅ Status badges
- ✅ Conditional rendering based on status

### **Testing (Belum)** ⏳

- ⏳ Test create unassigned route
- ⏳ Test assign driver/vehicle
- ⏳ Test UI transitions between statuses
- ⏳ Test validation (vehicle must be IDLE)
- ⏳ Test error handling

---

## 🚀 Cara Testing

### **1. Run Migration SQL** (Jika Belum)

```sql
-- Di phpMyAdmin
ALTER TABLE `route_plans`
MODIFY COLUMN `driverId` varchar(36) NULL,
MODIFY COLUMN `vehicleId` varchar(36) NULL;

ALTER TABLE `route_plans`
ADD COLUMN `assignmentStatus` ENUM('unassigned', 'assigned', 'departed', 'completed')
NOT NULL DEFAULT 'unassigned'
AFTER `date`;

UPDATE `route_plans`
SET `assignmentStatus` = 'assigned'
WHERE `driverId` IS NOT NULL AND `vehicleId` IS NOT NULL;
```

### **2. Restart Backend**

```powershell
cd amdk-airku-backend
node src/index.js
```

### **3. Restart Frontend**

```powershell
cd amdk-airku-frontend
npm run dev
```

### **4. Test Flow**

#### **A. Create Unassigned Route**

1. Login sebagai Admin
2. Buka "Perencanaan Rute"
3. Klik "Buat Rute Baru"
4. Pilih tanggal yang punya pesanan Pending
5. Klik "Buat Rute"
6. **Expected:** Rute muncul di section "Rute Belum Di-assign"

#### **B. Assign Driver & Vehicle**

1. Pada rute unassigned, klik "Assign Driver & Armada"
2. Modal terbuka
3. Pilih armada (hanya yang status IDLE muncul)
4. Pilih driver
5. Klik "Assign"
6. **Expected:**
   - Success alert muncul
   - Rute pindah ke section "Rute Sudah Di-assign"
   - Menampilkan info driver & armada

#### **C. View Route Details**

1. Klik "Lihat Detail Rute"
2. **Expected:** List pemberhentian dengan jarak muncul

#### **D. Delete/Cancel Route**

1. Klik "Hapus Rute" atau "Batalkan"
2. Confirm
3. **Expected:** Rute dihapus, pesanan kembali Pending

---

## 📊 Database Changes Summary

### **Before:**

```sql
CREATE TABLE route_plans (
    id VARCHAR(36) PRIMARY KEY,
    driverId VARCHAR(36) NOT NULL,     -- ← REQUIRED
    vehicleId VARCHAR(36) NOT NULL,    -- ← REQUIRED
    date DATE NOT NULL
);
```

### **After:**

```sql
CREATE TABLE route_plans (
    id VARCHAR(36) PRIMARY KEY,
    driverId VARCHAR(36) NULL,         -- ← NULLABLE ✅
    vehicleId VARCHAR(36) NULL,        -- ← NULLABLE ✅
    date DATE NOT NULL,
    assignmentStatus ENUM(             -- ← NEW COLUMN ✅
        'unassigned',
        'assigned',
        'departed',
        'completed'
    ) DEFAULT 'unassigned'
);
```

---

## 🐛 Known Issues & Limitations

### **1. Button "Berangkatkan" Belum Fungsional**

- Button sudah ada di UI
- Backend endpoint belum dibuat
- Perlu endpoint: `PUT /api/routes/plan/:routeId/depart`

### **2. Filter Vehicle by Capacity**

- Saat assign, tidak cek apakah kapasitas vehicle cukup
- Suggestion: Tampilkan warning jika kapasitas kurang

### **3. Multiple Routes Same Date**

- Bisa create multiple routes untuk tanggal yang sama
- Perlu validasi atau group logic

---

## 📝 Next Steps

### **Priority 1: Implement Depart Function**

```typescript
// Backend: routeController.js
exports.departRoute = async (req, res) => {
  const { routeId } = req.params;
  await db.query(
    `
        UPDATE route_plans 
        SET assignmentStatus = 'departed' 
        WHERE id = ?
    `,
    [routeId]
  );
  res.json({ success: true, message: "Rute berhasil diberangkatkan" });
};

// Frontend: RoutePlanning.tsx
const handleDepartRoute = (routeId: string) => {
  if (confirm("Berangkatkan rute ini?")) {
    departRouteMutation.mutate(routeId);
  }
};
```

### **Priority 2: Add Capacity Validation**

```typescript
// Saat assign vehicle, cek total kapasitas yang dibutuhkan
const totalCapacityNeeded = route.stops.reduce((sum, stop) => {
  return sum + calculateOrderCapacity(stop.orderId);
}, 0);

if (totalCapacityNeeded > vehicle.capacity) {
  alert("⚠️ Kapasitas vehicle tidak cukup!");
  return;
}
```

### **Priority 3: Real-time Status Updates**

```typescript
// Gunakan WebSocket atau polling untuk update status real-time
// Ketika driver update status di mobile app, langsung reflect di admin panel
```

---

## 🎉 Benefits dari Update Ini

### **1. Fleksibilitas**

- ✅ Admin bisa buat rute dulu, assign nanti
- ✅ Tidak terburu-buru pilih driver/vehicle
- ✅ Bisa optimasi assignment berdasarkan availability

### **2. Better Planning**

- ✅ Lihat overview semua rute unassigned
- ✅ Assign multiple routes sekaligus
- ✅ Prioritas rute yang urgent

### **3. Status Tracking**

- ✅ Clear visualization: Unassigned → Assigned → Departed → Completed
- ✅ Easy monitoring
- ✅ Audit trail lengkap

### **4. UX Improvement**

- ✅ Informasi lebih jelas dengan badges warna
- ✅ Section terpisah untuk setiap status
- ✅ Modal assignment yang informatif
- ✅ Inline route details tanpa pindah halaman

---

## 📞 Troubleshooting

### **Issue: Rute tidak muncul setelah dibuat**

**Solution:**

- Cek console browser untuk error
- Pastikan response API sukses
- Verify query invalidation: `queryClient.invalidateQueries({ queryKey: ['deliveryRoutes'] })`

### **Issue: Assign button tidak muncul**

**Solution:**

- Cek `route.assignmentStatus` harus 'unassigned'
- Verify `routesByStatus.unassigned` tidak kosong

### **Issue: Vehicle list kosong saat assign**

**Solution:**

- Pastikan ada vehicle dengan status IDLE
- Filter: `vehicles.filter(v => v.status === VehicleStatus.IDLE)`

### **Issue: Backend error 404 saat assign**

**Solution:**

- Pastikan endpoint sudah ada: `PUT /api/routes/plan/:routeId/assign`
- Check routeController.js exports `assignDriverVehicle`
- Verify routes.js: `router.put('/:routeId/assign', assignDriverVehicle)`

---

## ✅ Status: **READY FOR TESTING**

**Date Completed:** 27 Oktober 2025  
**Version:** 2.0 (New Flow)  
**Tested:** ⏳ Pending  
**Production Ready:** ⏳ After Testing

---

**Next Action:** Run migration SQL → Restart backend → Test create unassigned route → Test assign driver/vehicle
