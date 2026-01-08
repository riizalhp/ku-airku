require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zqnhqzyhkmcusiainkkn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Connecting to:', SUPABASE_URL);
if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verify() {
    const { data, error, count } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching surveys:', error.message);
    } else {
        console.log(`✅ Found ${count} survey responses.`);
        console.log('Sample data:', data.slice(0, 1));
    }
}

verify();
