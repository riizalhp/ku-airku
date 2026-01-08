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

function parseUsers(sqlContent) {
    const regex = /INSERT INTO\s+`users`\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+?);/gmi;
    const match = regex.exec(sqlContent);
    if (!match) return [];

    const columns = match[1].split(',').map(c => c.trim().replace(/`/g, ''));
    const valuesBlock = match[2];
    const userRows = [];

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
        columns.forEach((col, idx) => {
            rowObj[col] = values[idx];
        });
        userRows.push(rowObj);
    });
    return userRows;
}

function cleanValue(val) {
    val = val.trim();
    if (val === 'NULL') return null;
    if (val.startsWith("'") && val.endsWith("'")) return val.slice(1, -1).replace(/\\'/g, "'");
    return val;
}

async function fixUsers() {
    console.log('--- Fixing User Migration (Email Lookup Strategy) ---');
    if (!fs.existsSync(SQL_FILE_PATH)) {
        console.error('SQL file not found!');
        return;
    }

    const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');
    const users = parseUsers(sqlContent);
    console.log(`Found ${users.length} users in SQL dump.`);

    for (const user of users) {
        console.log(`Processing: ${user.name} (${user.email})`);

        // Check if user exists in Auth by Email
        // Note: listUsers is paginated but for small lists default is 50.
        // For robustness, ideally we fetch by email directly if API supports, or search.
        // admin.listUsers() doesn't filter by email directly in older versions? 
        // Newer version has filtering. Let's try listUsers with no filter and find. Since < 10 users.
        const { data: { users: authUsers }, error: listError } = await supabase.auth.admin.listUsers();

        let authUser = authUsers ? authUsers.find(u => u.email.toLowerCase() === user.email.toLowerCase()) : null;
        let authId = authUser ? authUser.id : null;

        if (!authId) {
            console.log('   Creating Supabase Auth user...');
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: 'password123',
                email_confirm: true,
                user_metadata: { full_name: user.name, role: user.role }
            });
            if (createError) {
                console.error(`   ❌ Auth Create Failed: ${createError.message}`);
                continue; // Can't proceed if no Auth User
            }
            authId = newUser.user.id;
            console.log(`   ✅ Auth user created (ID: ${authId})`);
        } else {
            console.log(`   ℹ️ Auth user found (ID: ${authId})`);
        }

        // 2. Insert into Public Users using AUTH ID
        const { error: upsertError } = await supabase.from('users').upsert({
            id: authId, // Use the correct Auth ID
            name: user.name,
            role: user.role,
            email: user.email
        });

        if (upsertError) {
            console.error(`   ❌ Public Insert Failed: ${upsertError.message}`);
        } else {
            console.log('   ✅ Public profile synced.');
        }
    }
}

fixUsers();
