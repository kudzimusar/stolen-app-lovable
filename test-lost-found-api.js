// Test Lost and Found API endpoints
// This script tests the Lost and Found API to ensure it's working properly

const SUPABASE_URL = 'https://lerjhxchglztvhbsdjjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcmpoeGNoZ2x6dHZoYnNkampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzAyOTIsImV4cCI6MjA2OTIwNjI5Mn0.nzbVcrz576dB30B2lcazoWhAuK-XRRdYAIxBI_qesIs';

async function testLostFoundAPI() {
    console.log('🧪 Testing Lost and Found API...\n');

    // Test 1: Get all reports
    console.log('1️⃣ Testing GET /api/v1/lost-found/reports');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/lost-found-reports`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('✅ Status:', response.status);
        console.log('📊 Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Get community stats
    console.log('2️⃣ Testing GET /api/v1/lost-found/community/stats');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/lost-found-reports/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('✅ Status:', response.status);
        console.log('📊 Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Create a test report
    console.log('3️⃣ Testing POST /api/v1/lost-found/reports');
    try {
        const testReport = {
            report_type: 'lost',
            device_category: 'Smartphone',
            device_model: 'iPhone 15 Pro Max',
            description: 'Test report from API test script',
            location_lat: -26.1076,
            location_lng: 28.0567,
            location_address: 'Test Location, Johannesburg',
            reward_amount: 1000,
            photos: [],
            documents: []
        };

        const response = await fetch(`${SUPABASE_URL}/functions/v1/lost-found-reports`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testReport)
        });
        
        const data = await response.json();
        console.log('✅ Status:', response.status);
        console.log('📊 Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Test community tips
    console.log('4️⃣ Testing GET /api/v1/community-tips');
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/community-tips`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('✅ Status:', response.status);
        console.log('📊 Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n🎉 Lost and Found API testing complete!');
}

// Run the test
testLostFoundAPI().catch(console.error);
