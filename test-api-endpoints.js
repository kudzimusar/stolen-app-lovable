// Test API Endpoints - Quick verification script
// Run this in browser console to test the marketplace APIs

console.log('🧪 Testing Marketplace API Endpoints...');

// Test 1: Get auth token
async function getAuthToken() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('❌ Auth token error:', error);
    return null;
  }
}

// Test 2: Test marketplace-listings API
async function testMarketplaceListings() {
  console.log('🔍 Testing marketplace-listings API...');
  
  const token = await getAuthToken();
  if (!token) {
    console.error('❌ No auth token available');
    return;
  }

  try {
    const response = await fetch('/api/v1/marketplace/listings?limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Marketplace listings response:', result);
      console.log(`📋 Found ${result.listings?.length || 0} listings`);
      
      if (result.listings && result.listings.length > 0) {
        console.log('🎯 First listing sample:', result.listings[0]);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Fetch error:', error);
  }
}

// Test 3: Test my-devices API
async function testMyDevices() {
  console.log('📱 Testing my-devices API...');
  
  const token = await getAuthToken();
  if (!token) {
    console.error('❌ No auth token available');
    return;
  }

  try {
    const response = await fetch('/api/v1/devices/my-devices', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ My devices response:', result);
      console.log(`📱 Found ${result.devices?.length || 0} devices`);
      
      if (result.devices && result.devices.length > 0) {
        const deviceWithMarketplace = result.devices.find(d => d.marketplaceStatus?.isListed);
        if (deviceWithMarketplace) {
          console.log('🎯 Device with marketplace listing:', deviceWithMarketplace);
          console.log('📋 Marketplace status:', deviceWithMarketplace.marketplaceStatus);
        } else {
          console.log('⚠️ No devices found with marketplace listings');
        }
      }
    } else {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Fetch error:', error);
  }
}

// Test 4: Test admin approve listing API
async function testAdminApprove() {
  console.log('👤 Testing admin approve listing API...');
  
  const token = await getAuthToken();
  if (!token) {
    console.error('❌ No auth token available');
    return;
  }

  // First get a listing ID to test with
  try {
    const listingsResponse = await fetch('/api/v1/marketplace/listings?status=all&limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (listingsResponse.ok) {
      const listingsResult = await listingsResponse.json();
      
      if (listingsResult.listings && listingsResult.listings.length > 0) {
        const testListing = listingsResult.listings[0];
        console.log('🎯 Testing with listing:', testListing.id);
        
        // Test approve
        const approveResponse = await fetch('/api/v1/admin/approve-listing', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            listingId: testListing.id,
            action: 'approve'
          })
        });

        console.log('📊 Approve response status:', approveResponse.status);
        
        if (approveResponse.ok) {
          const approveResult = await approveResponse.json();
          console.log('✅ Approve response:', approveResult);
        } else {
          const errorText = await approveResponse.text();
          console.error('❌ Approve API Error:', errorText);
        }
      } else {
        console.log('⚠️ No listings found to test approve API');
      }
    }
  } catch (error) {
    console.error('❌ Admin test error:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive API tests...');
  
  await testMarketplaceListings();
  console.log('---');
  await testMyDevices();
  console.log('---');
  await testAdminApprove();
  
  console.log('✅ All tests completed!');
}

// Export functions for manual testing
window.testMarketplaceListings = testMarketplaceListings;
window.testMyDevices = testMyDevices;
window.testAdminApprove = testAdminApprove;
window.runAllTests = runAllTests;

console.log('🔧 Test functions available:');
console.log('  - testMarketplaceListings()');
console.log('  - testMyDevices()');
console.log('  - testAdminApprove()');
console.log('  - runAllTests()');
console.log('Run any of these in console to test the APIs!');
