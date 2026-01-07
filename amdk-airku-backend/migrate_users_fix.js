require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// --- CONFIG ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zqnhqzyhkmcusiainkkn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SQL_FILE_PATH = path.resolve('..', 'amdk_airku_db.sql');

if (!SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- HELPER: Parse just the USERS table from SQL ---
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
    console.log('--- Fixing User Migration ---');
    if (!fs.existsSync(SQL_FILE_PATH)) {
        console.error('SQL file not found!');
        return;
    }

    const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');
    const users = parseUsers(sqlContent);
    console.log(`Found ${users.length} users in SQL dump.`);

    for (const user of users) {
        console.log(`Processing: ${user.name} (${user.email}) - ID: ${user.id}`);

        // 1. Create Auth User
        // We use upsert-like logic: check exist, if not create.
        const { data: existingUser } = await supabase.auth.admin.getUserById(user.id);

        if (!existingUser || !existingUser.user) {
            console.log('   Creating Supabase Auth user...');
            const { error: createError } = await supabase.auth.admin.createUser({
                id: user.id, // FORCE ID
                email: user.email,
                password: 'password123',
                email_confirm: true,
                user_metadata: { full_name: user.name, role: user.role }
            });
            if (createError) {
                console.error(`   ❌ Auth Create Failed: ${createError.message}`);
                // Continue anyway, maybe it failed because email exists under different ID?
            } else {
                console.log('   ✅ Auth user created.');
            }
        } else {
            console.log('   ℹ️ Auth user already exists.');
        }

        // 2. Insert into Public Users
        // Now that Auth user exists (or we attempted), try inserting public profile.
        // We use upsert to overwrite/ensure consistency.
        const { error: upsertError } = await supabase.from('users').upsert({
            id: user.id,
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
