// Complete Lost and Found Feature Test
// This script tests the entire Lost and Found feature end-to-end

const SUPABASE_URL = 'https://lerjhxchglztvhbsdjjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcmpoeGNoZ2x6dHZoYnNkampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzAyOTIsImV4cCI6MjA2OTIwNjI5Mn0.nzbVcrz576dB30B2lcazoWhAuK-XRRdYAIxBI_qesIs';

async function testLostFoundComplete() {
    console.log('🧪 Testing Complete Lost and Found Feature...\n');

    // Test 1: Check if database tables exist
    console.log('1️⃣ Testing Database Tables');
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/lost_found_reports?select=count`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        if (response.ok) {
            console.log('✅ Lost Found Reports table exists');
        } else {
            console.log('❌ Lost Found Reports table not accessible:', response.status);
        }
    } catch (error) {
        console.log('❌ Error accessing database:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Test API Functions
    console.log('2️⃣ Testing API Functions');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/lost-found-reports`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('✅ API Function Status:', response.status);
        console.log('📊 Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('❌ API Function Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Test Community Stats
    console.log('3️⃣ Testing Community Stats');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/lost-found-reports/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('✅ Stats API Status:', response.status);
        console.log('📊 Stats Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('❌ Stats API Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Test Database Functions
    console.log('4️⃣ Testing Database Functions');
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_community_stats`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        
        const data = await response.json();
        console.log('✅ Database Function Status:', response.status);
        console.log('📊 Function Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('❌ Database Function Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 5: Test Nearby Reports Function
    console.log('5️⃣ Testing Nearby Reports Function');
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/find_nearby_reports`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                search_lat: -26.1076,
                search_lng: 28.0567,
                radius_km: 10
            })
        });
        
        const data = await response.json();
        console.log('✅ Nearby Reports Function Status:', response.status);
        console.log('📊 Nearby Reports Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('❌ Nearby Reports Function Error:', error.message);
    }

    console.log('\n🎉 Lost and Found Feature Testing Complete!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Open the app and navigate to Community Board');
    console.log('2. Login to your account');
    console.log('3. Click "Test Data" button to insert sample data');
    console.log('4. Verify data appears in the Community Board');
    console.log('5. Test submitting a new lost/found report');
    console.log('6. Test the "View Details" and "Contact" functionality');
}

// Run the test
testLostFoundComplete().catch(console.error);
