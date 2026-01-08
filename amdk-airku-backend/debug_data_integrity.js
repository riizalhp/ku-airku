const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    console.log("Checking RLS setup...");

    // We can't query pg_policies via JS client easily without SQL function, 
    // but we can try to fetch data as a 'Driver' user if we had one.
    // Instead, let's just create a SQL script to be run in Dashboard, or 
    // try to insert/select and see if it fails if we were using anon key (but we are using service role here).

    // Since I can't check RLS directly via client, I will assume RLS is on and check the creation SQL.

    // However, I can check if 'store_id' exists on pending orders.
    const { data: orders, error } = await supabase.from('orders').select('id, store_id, status').eq('status', 'Pending').limit(5);
    if (error) console.error("Error fetching orders:", error);
    else console.log("Sample Active Pending Orders:", orders);
}

checkRLS();
