require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function listAuthUsers() {
    console.log('Listing Auth Users...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    if (!users || users.length === 0) {
        console.log('❌ No users found in Supabase Auth!');
    } else {
        console.log(`✅ Found ${users.length} users in Supabase Auth:`);
        users.forEach(u => {
            console.log(`- ${u.email} (ID: ${u.id}) | Confirmed: ${u.email_confirmed_at ? 'YES' : 'NO'} | Last Sign In: ${u.last_sign_in_at}`);
        });
    }
}

listAuthUsers();
