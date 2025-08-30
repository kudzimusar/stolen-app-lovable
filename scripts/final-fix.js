import fs from 'fs';

function fixRemainingImports() {
  console.log('🔧 Fixing remaining import issues...\n');
  
  const appPath = 'src/App.tsx';
  let content = fs.readFileSync(appPath, 'utf8');
  let changesMade = 0;

  // Fix the remaining commented imports
  const fixes = [
    {
      pattern: /\/\/ import GeolocationTesting from "\.\/pages\/security\/GeolocationTesting";\/\/ File doesn't exist/g,
      replacement: 'import GeolocationTesting from "./pages/security/GeolocationTesting";'
    },
    {
      pattern: /\/\/ import HotBuyerRequest from "\.\/pages\/marketplace\/HotBuyerRequest";\/\/ File doesn't exist/g,
      replacement: 'import HotBuyerRequest from "./pages/marketplace/HotBuyerRequest";'
    }
  ];

  fixes.forEach(fix => {
    if (content.match(fix.pattern)) {
      content = content.replace(fix.pattern, fix.replacement);
      changesMade++;
      console.log(`  ✅ Fixed: ${fix.replacement.split(' from ')[0].replace('import ', '')}`);
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(appPath, content);
    console.log(`\n📝 Made ${changesMade} final fixes to App.tsx`);
  } else {
    console.log(`\n✅ No additional fixes needed`);
  }

  return changesMade;
}

console.log('🚀 Final import cleanup...\n');
const totalFixes = fixRemainingImports();
console.log(`\n🎉 Final cleanup completed! Total fixes: ${totalFixes}`);
