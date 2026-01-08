require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zqnhqzyhkmcusiainkkn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verify() {
    const { count: productCount, error: pError } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: vehicleCount, error: vError } = await supabase.from('vehicles').select('*', { count: 'exact', head: true });
    const { count: orderCount, error: oError } = await supabase.from('orders').select('*', { count: 'exact', head: true });

    const { count: storeCount, error: sError } = await supabase.from('stores').select('*', { count: 'exact', head: true });

    const { count: visitCount, error: vError2 } = await supabase.from('visits').select('*', { count: 'exact', head: true });
    const { count: routePlanCount, error: rpError } = await supabase.from('route_plans').select('*', { count: 'exact', head: true });
    const { count: surveyCount, error: survError } = await supabase.from('survey_responses').select('*', { count: 'exact', head: true });

    console.log('--- Verification Stats ---');
    if (sError) console.error('Stores Error:', sError.message); else console.log(`Stores: ${storeCount}`);
    if (pError) console.error('Products Error:', pError.message); else console.log(`Products: ${productCount}`);
    if (vError) console.error('Vehicles Error:', vError.message); else console.log(`Vehicles: ${vehicleCount}`);
    if (oError) console.error('Orders Error:', oError.message); else console.log(`Orders: ${orderCount}`);

    if (vError2) console.error('Visits Error:', vError2.message); else console.log(`Visits: ${visitCount}`);
    if (rpError) console.error('RoutePlans Error:', rpError.message); else console.log(`RoutePlans: ${routePlanCount}`);
    if (survError) console.error('Surveys Error:', survError.message); else console.log(`Surveys: ${surveyCount}`);
}

verify();
