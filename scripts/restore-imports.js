import fs from 'fs';

// List of imports that we've now created
const restoredImports = [
  'EscrowPayment',
  'RepairShopDashboard', 
  'NGODashboard',
  'FeedbackRating',
  'InsuranceDashboard'
];

function restoreImports(filePath) {
  console.log(`🔧 Restoring imports in: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  let changesMade = 0;
  
  // Restore commented imports
  for (const importName of restoredImports) {
    const commentedImportRegex = new RegExp(`// import ${importName} from "([^"]+)"; // File doesn't exist`, 'g');
    const matches = updatedContent.match(commentedImportRegex);
    if (matches) {
      updatedContent = updatedContent.replace(commentedImportRegex, `import ${importName} from "$1";`);
      changesMade += matches.length;
      console.log(`  ✅ Restored: ${importName}`);
    }
  }
  
  // Restore commented routes
  for (const importName of restoredImports) {
    const commentedRouteRegex = new RegExp(`{/\\* <Route path="/[^"]*" element={<${importName} />} /> \\*/}`, 'g');
    const matches = updatedContent.match(commentedRouteRegex);
    if (matches) {
      updatedContent = updatedContent.replace(commentedRouteRegex, `<Route path="/${importName.toLowerCase()}" element={<${importName} />} />`);
      changesMade += matches.length;
      console.log(`  ✅ Restored route for: ${importName}`);
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

console.log('🚀 Starting to restore imports...\n');

let totalChanges = 0;

// Restore imports in App.tsx
if (fs.existsSync('src/App.tsx')) {
  const changes = restoreImports('src/App.tsx');
  totalChanges += changes;
}

console.log(`\n🎉 Import restoration completed!`);
console.log(`📝 Total changes made: ${totalChanges}`);
