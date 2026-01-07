require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function syncUsers() {
    console.log('1. Fetching legacy users from public.users table...');

    // Fetch from public schema
    const { data: legacyUsers, error } = await supabase.from('users').select('*');
    if (error) {
        console.error('❌ Error fetching public users:', error.message);
        return;
    }

    if (!legacyUsers || legacyUsers.length === 0) {
        console.log('⚠️ No users found in public.users table. Did migration run?');
        return;
    }

    console.log(`✅ Found ${legacyUsers.length} legacy users in database.`);

    for (const user of legacyUsers) {
        console.log(`\nProcessing: ${user.name} (${user.email})`);
        console.log(`   ID: ${user.id}`);

        // Check if exists
        const { data: existingUser, error: findError } = await supabase.auth.admin.getUserById(user.id);

        if (existingUser && existingUser.user) {
            console.log('   ⚠️ User already exists in Auth. Skipping.');
            continue;
        }

        // Create
        const { data, error: createError } = await supabase.auth.admin.createUser({
            id: user.id, // FORCE SAME ID
            email: user.email,
            password: 'password123',
            email_confirm: true,
            user_metadata: {
                full_name: user.name,
                role: user.role
            }
        });

        if (createError) {
            console.error(`   ❌ Failed to create auth user: ${createError.message}`);
        } else {
            console.log(`   ✅ Auth user created successfully.`);
        }
    }
    console.log('\n✨ Sync process finished.');
}

syncUsers();
