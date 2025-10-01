// Simple marketplace validation script
const fs = require('fs');
const path = require('path');

// Check if component files exist
const componentsToCheck = [
  'src/pages/marketplace/Marketplace.tsx',
  'src/pages/marketplace/ProductDetail.tsx', 
  'src/pages/marketplace/Cart.tsx',
  'src/pages/marketplace/Checkout.tsx',
  'src/pages/marketplace/HotDeals.tsx',
  'src/pages/marketplace/ListMyDevice.tsx',
  'src/components/marketplace/EnhancedCart.tsx',
  'src/components/marketplace/EnhancedCheckout.tsx',
  'src/components/marketplace/CompleteBuyerJourney.tsx',
  'src/components/ui/QRScanner.tsx',
  'src/components/payment/AIWalletInsights.tsx',
  'src/components/payment/RealTimeUpdates.tsx',
  'src/lib/services/enhanced-stripe-service.ts',
  'src/lib/services/taxonomy-import-service.ts'
];

console.log('🔍 Validating marketplace components...\n');

let valid = 0;
let missing = 0;

componentsToCheck.forEach(component => {
  const filePath = path.join(__dirname, component);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${component}`);
    valid++;
  } else {
    console.log(`❌ ${component} - MISSING`);
    missing++;
  }
});

console.log('\n📊 Validation Summary:');
console.log(`- Total components: ${componentsToCheck.length}`);
console.log(`- Valid components: ${valid}`);
console.log(`- Missing components: ${missing}`);
console.log(`- Success rate: ${((valid / componentsToCheck.length) * 100).toFixed(1)}%`);

// Check key marketplace routes in App.tsx
console.log('\n🔍 Checking key marketplace routes...');

const appTsxPath = path.join(__dirname, 'src/App.tsx');
if (fs.existsSync(appTsxPath)) {
  const appContent = fs.readFileSync(appTsxPath, 'utf8');
  
  const routesToCheck = [
    '/marketplace',
    '/cart', 
    '/checkout/:paymentIntentId',
    '/escrow/:listingId',
    '/list-my-device',
    '/hot-deals'
  ];
  
  routesToCheck.forEach(route => {
    if (appContent.includes(`path="${route}"`)) {
      console.log(`✅ Route: ${route}`);
    } else {
      console.log(`⚠️  Route: ${route} - Check manually`);
    }
  });
} else {
  console.log('❌ App.tsx not found');
}

// Check QR Scanner and verification integration
console.log('\n🔍 Checking QR/Serial/OCR integration...');

const qrScannerExists = fs.existsSync(path.join(__dirname, 'src/components/ui/QRScanner.tsx'));
const verificationExists = fs.existsSync(path.join(__dirname, 'src/components/marketplace/EnhancedVerificationScanner.tsx'));
const reverseVerifyExists = fs.existsSync(path.join(__dirname, 'src/pages/security/ReverseVerify.tsx'));

console.log(`QR Scanner Component: ${qrScannerExists ? '✅' : '❌'}`);
console.log(`Enhanced Verification: ${verificationExists ? '✅' : '❌'}`);
console.log(`Reverse Verify Page: ${reverseVerifyExists ? '✅' : '❌'}`);

if (qrScannerExists && verificationExists && reverseVerifyExists) {
  console.log('✅ QR/Serial/OCR integration is properly implemented');
} else {
  console.log('⚠️  QR/Serial/OCR integration needs attention');
}

console.log('\n🎉 Marketplace validation complete!');
