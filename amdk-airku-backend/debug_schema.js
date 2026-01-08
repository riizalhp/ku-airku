const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) { process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);

async function probeColumns() {
    console.log("Probing route_stops columns...");

    // Test 1: route_id
    const { error: err1 } = await supabase.from('route_stops').select('route_id').limit(1);
    if (err1) console.log("route_id check failed:", err1.message);
    else console.log("route_id EXISTS!");

    // Test 2: route_plan_id
    const { error: err2 } = await supabase.from('route_stops').select('route_plan_id').limit(1);
    if (err2) console.log("route_plan_id check failed:", err2.message);
    else console.log("route_plan_id EXISTS!");

    // Test 3: plan_id
    const { error: err3 } = await supabase.from('route_stops').select('plan_id').limit(1);
    if (err3) console.log("plan_id check failed:", err3.message);
    else console.log("plan_id EXISTS!");
}

probeColumns();
