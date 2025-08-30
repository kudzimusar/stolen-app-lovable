import fs from 'fs';
import path from 'path';

// List of imports that reference non-existent files
const missingImports = [
  'EscrowPayment',
  'RepairShopDashboard', 
  'NGODashboard',
  'FeedbackRating',
  'InsuranceDashboard',
  'GeolocationTesting',
  'HotBuyerRequest',
  'PaymentDashboard',
  'RetailerInventory',
  'RetailerSales',
  'NewInsuranceClaim'
];

function commentOutMissingImports(filePath) {
  console.log(`🔧 Commenting out missing imports in: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  let changesMade = 0;
  
  // Comment out imports for missing files
  for (const missingImport of missingImports) {
    const importRegex = new RegExp(`import\\s+${missingImport}\\s+from\\s+["'][^"']+["'];?\\s*`, 'g');
    const matches = updatedContent.match(importRegex);
    if (matches) {
      updatedContent = updatedContent.replace(importRegex, `// import ${missingImport} from "./pages/..."; // File doesn't exist`);
      changesMade += matches.length;
      console.log(`  ✅ Commented out: ${missingImport}`);
    }
  }
  
  // Also comment out the corresponding Route components
  for (const missingImport of missingImports) {
    const routeRegex = new RegExp(`<Route[^>]*<${missingImport}[^>]*>.*?</${missingImport}>[^>]*>`, 'gs');
    const matches = updatedContent.match(routeRegex);
    if (matches) {
      updatedContent = updatedContent.replace(routeRegex, `{/* <Route path="/..." element={<${missingImport} />} /> */}`);
      changesMade += matches.length;
      console.log(`  ✅ Commented out route for: ${missingImport}`);
    }
  }
  
  if (changesMade > 0) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`  📝 Made ${changesMade} changes to ${filePath}`);
  } else {
    console.log(`  ✅ No changes needed for ${filePath}`);
  }
  
  return changesMade;
}

console.log('🚀 Starting to comment out missing imports...\n');

let totalChanges = 0;

// Comment out missing imports in App.tsx
if (fs.existsSync('src/App.tsx')) {
  const changes = commentOutMissingImports('src/App.tsx');
  totalChanges += changes;
}

console.log(`\n🎉 Commenting completed!`);
console.log(`📝 Total changes made: ${totalChanges}`);
