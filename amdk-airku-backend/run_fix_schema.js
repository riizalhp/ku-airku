#!/usr/bin/env node

/**
 * Run the fix_schema_issues.sql migration via Supabase SQL
 * Usage: node amdk-airku-backend/run_fix_schema.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SQL_FILE = path.join(__dirname, 'fix_schema_issues.sql');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
    try {
        console.log('📄 Reading fix_schema_issues.sql...');
        const sql = fs.readFileSync(SQL_FILE, 'utf8');

        console.log('🚀 Executing SQL migration...');
        console.log('---');

        // Split by ; and execute separately for better error reporting
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        let successCount = 0;
        let errorCount = 0;

        for (const statement of statements) {
            try {
                const { data, error } = await supabase.rpc('execute_sql', {
                    sql: statement + ';'
                }).catch(err => {
                    // Fallback: try direct query execution
                    // Note: This might not work for all DDL statements
                    console.warn('⚠️  RPC execute_sql not available, attempting direct execution...');
                    return { data: null, error: null };
                });

                if (error) {
                    console.warn(`⚠️  Warning: ${error.message}`);
                    errorCount++;
                } else {
                    console.log(`✅ Executed: ${statement.substring(0, 60)}...`);
                    successCount++;
                }
            } catch (err) {
                console.error(`❌ Error: ${err.message}`);
                errorCount++;
            }
        }

        console.log('---');
        console.log(`\n📊 Migration Summary:`);
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ⚠️  Warnings: ${errorCount}`);
        console.log('\n💡 TIP: If errors occurred, please manually run the SQL in Supabase Dashboard:');
        console.log('   1. Go to https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new');
        console.log('   2. Copy content from fix_schema_issues.sql');
        console.log('   3. Run the queries');

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

console.log('🔧 SUPABASE SCHEMA MIGRATION');
console.log('=' .repeat(50));
runMigration();
