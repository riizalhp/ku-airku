# Deprecation: capacityUnit Field

## Date

November 2, 2025

## Problem Identified

The original design stored `capacityUnit` in the `products` table, implying that each product has a single homogeneous capacity value. However, this is **architecturally incorrect**.

### Why It's Wrong

**Homogeneous capacity depends on BOTH vehicle type AND product type**, not just the product alone.

**Example:** Air Minum 240ml

- When loaded in **L300** → can carry **200 units**
- When loaded in **Cherry Box** → can carry **170 units**

The same product has different homogeneous capacities depending on which vehicle is used.

## Solution

### What Changed

1. **`capacityUnit` field is now DEPRECATED**

   - Made nullable in database
   - No longer used in calculations
   - Kept for backward compatibility only

2. **Homogeneous capacity moved to code**

   - Now defined in `VEHICLE_CAPACITY_DATA` in `capacityCalculator.js`
   - Structure: `VEHICLE_CAPACITY_DATA[vehicleType].homogeneousCapacity[productType]`
   - Example:
     ```javascript
     'L300': {
       maxCapacity: 200,
       homogeneousCapacity: {
         '240ml': 200,
         '120ml': 350,
         '600ml': 150,
         '330ml': 200,
         '19L': 60
       }
     }
     ```

3. **`capacityConversionHeterogeneous` is the main field**
   - Used for mixed loads (heterogeneous)
   - Relative to 240ml = 1.0
   - Examples:
     - 240ml = 1.0
     - 120ml = 0.571 (smaller, takes less space)
     - 600ml = 1.6 (larger, takes more space)
     - 19L Galon = 3.33 (much larger)

### Frontend Changes

**ProductManagement.tsx:**

- Removed "Capacity Unit" input field
- Kept only "Konversi Kapasitas (Heterogen)" input
- Added info box explaining that homogeneous capacity is vehicle-dependent
- Updated preview to show both L300 and Cherry Box capacities

**types.ts:**

- Made `capacityUnit` optional with deprecation comment
- Updated `capacityConversionHeterogeneous` comment

### Backend Changes

**productModel.js:**

- Updated `create()` and `update()` to set `capacityUnit` to NULL by default
- Main field is now `capacityConversionHeterogeneous`

**capacityCalculator.js:**

- Already uses `VEHICLE_CAPACITY_DATA` (no changes needed)
- Homogeneous calculations use hardcoded data
- Heterogeneous calculations use `capacityConversionHeterogeneous` from database

## Database Migration

**File:** `migrations/deprecate_capacity_unit.sql`

**Steps:**

1. Make `capacityUnit` nullable
2. Update `capacityConversionHeterogeneous` for existing products
3. Set default value for new products

**Run:**

```bash
cd amdk-airku-backend/migrations
run_deprecate_capacity_unit.bat
```

Or manually:

```bash
mysql -u root -p amdk_airku_db < deprecate_capacity_unit.sql
```

## Testing

After migration:

1. **Add New Product:**

   - Go to Admin → Manajemen Produk
   - Add product (e.g., "Air 240ml")
   - Notice: Only "Konversi Kapasitas (Heterogen)" field
   - Auto-calculate should detect and set conversion rate

2. **Test Capacity Calculator:**

   - Go to Admin → Kalkulator Kapasitas
   - Select L300
   - Add 1 product type (e.g., 100 units of 240ml)
   - Result should show: Homogen (max 200 units)
   - Select Cherry Box
   - Same product should show: Homogen (max 170 units)

3. **Test Mixed Load:**
   - Select L300
   - Add multiple product types (240ml, 120ml, 19L)
   - Should calculate using conversion rates
   - Should apply proportional reduction if exceeds capacity

## Rollback

If needed, run:

```sql
ALTER TABLE products MODIFY COLUMN capacityUnit DECIMAL(5,2) NOT NULL DEFAULT 1.00;
UPDATE products SET capacityUnit = 1.0 WHERE capacityUnit IS NULL;
```

Then revert frontend and backend code changes.

## Benefits

1. **Correct Data Model:** Reflects actual business logic
2. **No Data Duplication:** Single source of truth in code
3. **Easier Maintenance:** Update capacities in one place
4. **User Clarity:** UI now correctly explains capacity is vehicle-dependent
5. **Flexibility:** Can add new vehicle types without database changes

## Related Files

- `amdk-airku-frontend/src/components/admin/ProductManagement.tsx`
- `amdk-airku-frontend/src/types.ts`
- `amdk-airku-backend/src/models/productModel.js`
- `amdk-airku-backend/src/utils/capacityCalculator.js`
- `amdk-airku-backend/migrations/deprecate_capacity_unit.sql`
