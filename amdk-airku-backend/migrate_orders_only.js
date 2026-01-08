require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zqnhqzyhkmcusiainkkn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SQL_FILE_PATH = path.resolve('..', '..', 'ku_airku_db.sql');

if (!SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function parseInsertValues(sqlContent, tableName) {
    const regex = new RegExp(`INSERT INTO\\s+\`${tableName}\`\\s*\\(([^)]+)\\)\\s*VALUES\\s*([\\s\\S]+?);`, 'gmi');
    const matches = [];
    let match;
    while ((match = regex.exec(sqlContent)) !== null) {
        const columns = match[1].split(',').map(c => c.trim().replace(/`/g, ''));
        const valuesBlock = match[2];
        const rowStrings = valuesBlock.split(/\),\s*\(/);
        rowStrings.forEach(rowStr => {
            let cleanRow = rowStr.trim();
            if (cleanRow.startsWith('(')) cleanRow = cleanRow.substring(1);
            if (cleanRow.endsWith(')')) cleanRow = cleanRow.substring(0, cleanRow.length - 1);
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
            values.push(cleanValue(currentVal));
            const rowObj = {};
            columns.forEach((col, idx) => { rowObj[col] = values[idx]; });
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

async function run() {
    console.log('--- Migrating Orders ---');
    try {
        const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');

        // 1. Build User Map
        console.log('Fetching users...');
        const { data: users, error } = await supabase.from('users').select('id, email');
        if (error) throw error;

        const emailToSupabaseId = {};
        users.forEach(u => {
            if (u.email) emailToSupabaseId[u.email.toLowerCase()] = u.id;
        });

        console.log('Parsing dump users...');
        const dumpUsers = parseInsertValues(sqlContent, 'users');
        const legacyIdToSupabaseId = {};
        dumpUsers.forEach(u => {
            const email = u.email ? u.email.toLowerCase() : null;
            if (email && emailToSupabaseId[email]) {
                legacyIdToSupabaseId[u.id] = emailToSupabaseId[email];
            }
        });
        console.log(`User Map Size: ${Object.keys(legacyIdToSupabaseId).length}`);

        // 2. Parse & Insert Orders
        console.log('Parsing orders...');
        const dumpOrders = parseInsertValues(sqlContent, 'orders');
        console.log(`Found ${dumpOrders.length} orders.`);

        for (const row of dumpOrders) {
            const mappedUserId = legacyIdToSupabaseId[row.orderedById];
            const p = {
                id: row.id,
                store_id: row.storeId,
                total_amount: row.totalAmount,
                status: row.status,
                order_date: row.orderDate ? new Date(row.orderDate).toISOString() : null,
                desired_delivery_date: row.desiredDeliveryDate ? new Date(row.desiredDeliveryDate).toISOString() : null,
                assigned_vehicle_id: row.assignedVehicleId,
                ordered_by_id: mappedUserId || row.orderedById, // Fallback to raw ID if no map
                priority: row.priority === 1
            };

            console.log(`Inserting Order ${p.id} (User: ${p.ordered_by_id})...`);
            const { error: insertError } = await supabase.from('orders').upsert(p);
            if (insertError) {
                console.error(`❌ FAILED: ${insertError.message}`);
            } else {
                console.log(`✅ SUCCESS`);
            }
        }
    } catch (err) {
        console.error('CRITICAL FAILURE:', err);
    }
}

run();
