require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// --- CONFIG ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zqnhqzyhkmcusiainkkn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be Service Role Key to bypass RLS
const SQL_FILE_PATH = path.resolve('..', 'amdk_airku_db.sql');

if (!SUPABASE_SERVICE_KEY) {
    console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is missing in .env!');
    console.warn('You must provide the SERVICE_ROLE_KEY (not Anon Key) to insert data bypassing RLS.');
    console.warn('Please add SUPABASE_SERVICE_ROLE_KEY=... to your backend .env file.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- HELPERS to parse SQL INSERT statements ---
// This is a naive parser tailored for the specific SQL dump format provided.
function parseInsertValues(sqlContent, tableName) {
    // Regex based on standard mysqldump format: INSERT INTO `table` (...) VALUES (...), (...);
    const regex = new RegExp(`INSERT INTO\\s+\`${tableName}\`\\s*\\(([^)]+)\\)\\s*VALUES\\s*([\\s\\S]+?);`, 'gmi');
    const matches = [];
    let match;

    while ((match = regex.exec(sqlContent)) !== null) {
        const columns = match[1].split(',').map(c => c.trim().replace(/`/g, ''));
        const valuesBlock = match[2];

        // Split values by ")," to handle multiple rows. 
        // Warning: This simplistic split might fail if text content contains "),".
        // Robust parsing would require a state machine, but this should suffice for standard dumps.
        const rowStrings = valuesBlock.split(/\),\s*\(/);

        rowStrings.forEach(rowStr => {
            // Clean up leading/trailing parens
            let cleanRow = rowStr.trim();
            if (cleanRow.startsWith('(')) cleanRow = cleanRow.substring(1);
            if (cleanRow.endsWith(')')) cleanRow = cleanRow.substring(0, cleanRow.length - 1);

            // Parse individual values, handling quoted strings
            const values = [];
            let currentVal = '';
            let inQuote = false;

            for (let i = 0; i < cleanRow.length; i++) {
                const char = cleanRow[i];
                if (char === "'" && cleanRow[i - 1] !== '\\') {
                    inQuote = !inQuote;
                } else if (char === ',' && !inQuote) {
                    values.push(cleanValue(currentVal));
                    currentVal = '';
                } else {
                    currentVal += char;
                }
            }
            values.push(cleanValue(currentVal)); // Last value

            // Map to object
            const rowObj = {};
            columns.forEach((col, idx) => {
                rowObj[col] = values[idx];
            });
            matches.push(rowObj);
        });
    }
    return matches;
}

function cleanValue(val) {
    val = val.trim();
    if (val === 'NULL') return null;
    if (val.startsWith("'") && val.endsWith("'")) return val.slice(1, -1).replace(/\\'/g, "'");
    if (!isNaN(val)) return Number(val);
    return val;
}

async function migrateTable(tableName, sqlContent, supabaseTable, mapFn) {
    console.log(`\n--- Migrating ${tableName} -> ${supabaseTable} ---`);
    const rows = parseInsertValues(sqlContent, tableName);
    if (rows.length === 0) {
        console.log(`No data found for ${tableName}.`);
        return;
    }

    console.log(`Found ${rows.length} rows. preparing payload...`);
    const payload = rows.map(mapFn).filter(r => r !== null);

    // Batch insert
    const BATCH_SIZE = 100;
    for (let i = 0; i < payload.length; i += BATCH_SIZE) {
        const batch = payload.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from(supabaseTable).upsert(batch);
        if (error) {
            console.error(`Error inserting batch ${i}:`, error.message);
        } else {
            console.log(`Inserted rows ${i + 1} to ${Math.min(i + BATCH_SIZE, payload.length)}`);
        }
    }
}

async function runMigration() {
    try {
        if (!fs.existsSync(SQL_FILE_PATH)) {
            console.error(`SQL file not found at: ${SQL_FILE_PATH}`);
            process.exit(1);
        }

        const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');

        // 1. USERS (Public Profile only)
        // Public users table usually requires the ID to match auth.users ID.
        // If we duplicate users here, they won't be able to login unless we create auth users with same ID.
        // For now, we seed them so relations (Foreign Keys) works. 
        // User will have to "SignUp" again, which might generate new ID. 
        // IDEALLY: Use supabase admin api to create auth users. But we only have service key and this is complex.
        // ACCEPTABLE: Insert data now. User issues resolved later.
        await migrateTable('users', sqlContent, 'users', row => ({
            id: row.id,
            name: row.name,
            role: row.role,
            email: row.email
        }));

        // 2. STORES
        await migrateTable('stores', sqlContent, 'stores', row => ({
            id: row.id,
            name: row.name,
            address: row.address,
            region: row.region,
            owner_name: row.owner,
            phone: row.phone,
            is_partner: row.isPartner === 1,
            partner_code: row.partnerCode,
            created_at: row.subscribedSince ? new Date(row.subscribedSince).toISOString() : new Date().toISOString(),
            location: { lat: row.lat, lng: row.lng }
        }));

        // 3. PRODUCTS
        await migrateTable('products', sqlContent, 'products', row => ({
            id: row.id,
            sku: row.sku,
            name: row.name,
            price: row.price,
            stock: row.stock,
            reserved_stock: row.reservedStock,
            capacity_unit: row.capacityUnit,
            capacity_conversion_heterogeneous: row.capacityConversionHeterogeneous,
            capacity_conversion_homogeneous: row.capacityConversionHomogeneous
        }));

        // 4. VEHICLES
        await migrateTable('vehicles', sqlContent, 'vehicles', row => ({
            id: row.id,
            plate_number: row.plateNumber,
            model: row.model,
            capacity: row.capacity,
            status: row.status,
            vehicle_type: row.vehicleType
        }));

        // 5. VISITS
        await migrateTable('visits', sqlContent, 'visits', row => ({
            id: row.id,
            store_id: row.storeId,
            sales_person_id: row.salesPersonId,
            visit_date: row.visitDate ? new Date(row.visitDate).toISOString() : null,
            purpose: row.purpose,
            status: row.status,
            notes: row.notes,
            proof_of_visit_image: row.proofOfVisitImage
        }));

        // 6. ORDERS
        await migrateTable('orders', sqlContent, 'orders', row => ({
            id: row.id,
            store_id: row.storeId,
            total_amount: row.totalAmount,
            status: row.status,
            order_date: row.orderDate ? new Date(row.orderDate).toISOString() : null,
            desired_delivery_date: row.desiredDeliveryDate ? new Date(row.desiredDeliveryDate).toISOString() : null,
            assigned_vehicle_id: row.assignedVehicleId,
            ordered_by_id: row.orderedById,
            priority: row.priority === 1
        }));

        // 7. ORDER ITEMS
        await migrateTable('order_items', sqlContent, 'order_items', row => ({
            id: row.id,
            order_id: row.orderId,
            product_id: row.productId,
            quantity: row.quantity,
            original_price: row.originalPrice,
            special_price: row.specialPrice
        }));

        console.log('\n✅ Migration completed!');

    } catch (err) {
        console.error('Migration failed:', err);
    }
}

runMigration();
