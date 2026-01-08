require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zqnhqzyhkmcusiainkkn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SQL_FILE_PATH = path.resolve('..', '..', 'ku_airku_db.sql');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function parseInsertValues(sqlContent, tableName) {
    // Copy of the function from migration script
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

async function debug() {
    const { data: supabaseUsers, error } = await supabase.from('users').select('id, email');
    if (error) { console.error('Supabase Error:', error); return; }

    console.log(`Supabase Users Found: ${supabaseUsers.length}`);
    supabaseUsers.forEach(u => console.log(` - ${u.email} -> ${u.id}`));

    const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');
    const dumpUsers = parseInsertValues(sqlContent, 'users');
    console.log(`Dump Users Found: ${dumpUsers.length}`);
    dumpUsers.forEach(u => console.log(` - ${u.email} -> ${u.id}`));

    const legacyIdToSupabaseId = {};
    const emailToSupabaseId = {};
    supabaseUsers.forEach(u => {
        if (u.email) emailToSupabaseId[u.email.toLowerCase()] = u.id;
    });

    dumpUsers.forEach(u => {
        const email = u.email ? u.email.toLowerCase() : null;
        if (email && emailToSupabaseId[email]) {
            legacyIdToSupabaseId[u.id] = emailToSupabaseId[email];
        } else {
            console.warn(`WARNING: No match for dump user ${email}`);
        }
    });

    console.log(`Mapping Size: ${Object.keys(legacyIdToSupabaseId).length}`);
    Object.keys(legacyIdToSupabaseId).forEach(k => console.log(` ${k} -> ${legacyIdToSupabaseId[k]}`));
}

debug();
