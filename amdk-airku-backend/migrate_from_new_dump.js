require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// --- CONFIG ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zqnhqzyhkmcusiainkkn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be Service Role Key to bypass RLS
const SQL_FILE_PATH = path.resolve('..', '..', 'ku_airku_db.sql'); // Adjusted path

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
    if (!isNaN(val) && val !== '') return Number(val);
    return val;
}

// Helper to parse JSON string fields from dump
function parseJsonField(field) {
    if (!field) return null;
    if (typeof field === 'string') {
        try {
            // Remove outer quotes if any (should be handled by cleanValue, but just in case)
            // The dump usually has '[...]' which cleanValue keeps as string.
            // JSON.parse will convert string "[...]" to array object.
            return JSON.parse(field);
        } catch (e) {
            console.warn('Failed to parse JSON field:', field, e.message);
            return field; // Return as string if parse fails
        }
    }
    return field;
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

        // 0. PREPARE USER ID MAPPING
        console.log('Building User ID Map (Legacy -> Supabase)...');

        // Fetch existing users from Supabase (populated by migrate_users_fix.js)
        console.log('Fetching Supabase users...');
        let supabaseUsers = [];
        try {
            const { data, error } = await supabase.from('users').select('id, email');
            if (error) throw error;
            supabaseUsers = data;
            console.log(`Supabase Users fetched: ${supabaseUsers.length}`);
        } catch (e) {
            console.log('CRASH FETCHING USERS:', e);
            throw e;
        }

        const emailToSupabaseId = {};
        supabaseUsers.forEach(u => {
            if (u.email) emailToSupabaseId[u.email.toLowerCase()] = u.id;
        });

        // Parse Users from Dump to get Legacy ID -> Email
        console.log('Parsing dump users...');
        const dumpUsers = parseInsertValues(sqlContent, 'users');
        console.log(`Dump Users parsed: ${dumpUsers.length}`);

        const legacyIdToSupabaseId = {};

        dumpUsers.forEach(u => {
            const email = u.email ? u.email.toLowerCase() : null;
            if (email && emailToSupabaseId[email]) {
                legacyIdToSupabaseId[u.id] = emailToSupabaseId[email];
            }
        });

        console.log(`Mapped ${Object.keys(legacyIdToSupabaseId).length} user IDs.`);

        // 1. USERS - SKIP (Handled by migrate_users_fix.js)
        console.log('Skipping users table (handled by auth sync).');

        // 2. STORES - SKIPPED (Done)
        /*
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
        */

        // 3. PRODUCTS - SKIPPED (Done)
        /*
        await migrateTable('products', sqlContent, 'products', row => ({
            id: row.id,
            sku: row.sku,
            name: row.name,
            price: row.price,
            stock: row.stock,
            reserved_stock: row.reservedStock,
            capacity_unit: row.capacityUnit ? row.capacityUnit : null,
            capacity_conversion_heterogeneous: row.capacityConversionHeterogeneous || 1.0,
            capacity_conversion_homogeneous: row.capacityConversionHomogeneous || 1.0
        }));
        */

        // 4. VEHICLES - SKIPPED (Done)
        /*
        await migrateTable('vehicles', sqlContent, 'vehicles', row => {
            const validStatuses = ['Sedang Mengirim', 'Dalam Perbaikan', 'Idle'];
            let status = row.status;
            if (!validStatuses.includes(status)) {
                // console.warn(`Fixing invalid vehicle status: '${status}' -> 'Idle'`);
                status = 'Idle';
            }
            return {
                id: row.id,
                plate_number: row.plateNumber,
                model: row.model,
                capacity: row.capacity,
                status: status,
                vehicle_type: row.vehicleType
            };
        });
        */

        // 5. VISITS - SKIPPED (Done)
        /*
        await migrateTable('visits', sqlContent, 'visits', row => ({
            id: row.id,
            store_id: row.storeId,
            sales_person_id: legacyIdToSupabaseId[row.salesPersonId] || row.salesPersonId, // MAP ID
            visit_date: row.visitDate ? new Date(row.visitDate).toISOString() : null,
            purpose: row.purpose,
            status: row.status,
            notes: row.notes,
            proof_of_visit_image: row.proofOfVisitImage
        }));    
        */

        // 6. ORDERS
        console.log('--- Migrating ORDERS (Isolated) ---');
        const orderRows = parseInsertValues(sqlContent, 'orders');
        const orderPayload = orderRows.map(row => {
            const mappedId = legacyIdToSupabaseId[row.orderedById];
            return {
                id: row.id,
                store_id: row.storeId,
                total_amount: row.totalAmount,
                status: row.status,
                order_date: row.orderDate ? new Date(row.orderDate).toISOString() : null,
                desired_delivery_date: row.desiredDeliveryDate ? new Date(row.desiredDeliveryDate).toISOString() : null,
                assigned_vehicle_id: row.assignedVehicleId,
                ordered_by_id: mappedId || row.orderedById,
                priority: row.priority === 1
            };
        });

        // Insert manually with size 1
        console.log(`Processing ${orderPayload.length} orders...`);
        for (const order of orderPayload) {
            try {
                console.log(`Inserting Order ${order.id}... User: ${order.ordered_by_id}`);
                const { error } = await supabase.from('orders').upsert(order);
                if (error) {
                    console.error(`❌ Error inserting order ${order.id}:`, error.message);
                    console.error('Payload:', JSON.stringify(order));
                } else {
                    console.log(`✅ Order ${order.id} inserted.`);
                }
            } catch (err) {
                console.error(`CRITICAL ERROR processing order ${order.id}:`, err);
            }
        }

        // 7. ORDER ITEMS
        await migrateTable('order_items', sqlContent, 'order_items', row => ({
            id: row.id,
            order_id: row.orderId,
            product_id: row.productId,
            quantity: row.quantity,
            original_price: row.originalPrice,
            special_price: row.specialPrice
        }));

        // 8. ROUTE PLANS
        await migrateTable('route_plans', sqlContent, 'route_plans', row => ({
            id: row.id,
            driver_id: legacyIdToSupabaseId[row.driverId] || row.driverId, // MAP ID
            vehicle_id: row.vehicleId,
            date: row.date ? new Date(row.date).toISOString() : null,
            assignment_status: row.assignmentStatus || 'unassigned'
        }));

        // 9. ROUTE STOPS
        await migrateTable('route_stops', sqlContent, 'route_stops', row => ({
            id: row.id,
            route_plan_id: row.routePlanId,
            order_id: row.orderId,
            store_id: row.storeId,
            status: row.status,
            sequence: row.sequence,
            proof_of_delivery_image: row.proofOfDeliveryImage,
            failure_reason: row.failureReason
        }));

        // 10. SALES VISIT ROUTE PLANS
        await migrateTable('sales_visit_route_plans', sqlContent, 'sales_visit_route_plans', row => ({
            id: row.id,
            sales_person_id: legacyIdToSupabaseId[row.salesPersonId] || row.salesPersonId, // MAP ID
            date: row.date ? new Date(row.date).toISOString() : null
        }));

        // 11. SALES VISIT ROUTE STOPS
        await migrateTable('sales_visit_route_stops', sqlContent, 'sales_visit_route_stops', row => ({
            id: row.id,
            route_id: row.planId,
            visit_id: row.visitId,
            store_id: row.storeId,
            store_name: row.storeName,
            address: row.address,
            purpose: row.purpose,
            sequence: row.sequence,
            location: { lat: row.lat, lng: row.lng }
        }));

        // 12. SURVEY RESPONSES
        await migrateTable('survey_responses', sqlContent, 'survey_responses', row => {
            return {
                id: row.id,
                sales_person_id: legacyIdToSupabaseId[row.salesPersonId] || row.salesPersonId, // MAP ID
                survey_date: row.surveyDate ? new Date(row.surveyDate).toISOString() : null,
                store_name: row.storeName,
                store_address: row.storeAddress,
                store_phone: row.storePhone,
                most_sought_products: parseJsonField(row.mostSoughtProducts),
                popular_airku_variants: parseJsonField(row.popularAirkuVariants),
                competitor_prices: parseJsonField(row.competitorPrices),
                competitor_volumes: parseJsonField(row.competitorVolumes),
                feedback: row.feedback,
                proof_of_survey_image: row.proofOfSurveyImage
            };
        });

        console.log('\n✅ Migration completed!');

    } catch (err) {
        console.error('Migration failed:', err);
    }
}

runMigration();
