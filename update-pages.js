// Quick script to help identify pages that need ResponsiveLayout updates
const fs = require('fs');
const path = require('path');

const pagePaths = [
  'src/pages/CareTeamPage.js',
  'src/pages/HealthInforPage.js',
  'src/pages/DailyLogPage.js',
  'src/pages/ProgressNotesPage.js',
  'src/pages/SensoryPage.js',
  'src/pages/MedicalLog/MedicalLogPage.js'
];

pagePaths.forEach(pagePath => {
  const fullPath = path.join(__dirname, pagePath);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if already has ResponsiveLayout
    if (!content.includes('ResponsiveLayout')) {
      console.log(`\n=== ${pagePath} ===`);
      
      // Show first few lines to understand structure
      const lines = content.split('\n');
      console.log('First 15 lines:');
      lines.slice(0, 15).forEach((line, idx) => {
        console.log(`${idx + 1}: ${line}`);
      });
      
      // Show return statement area
      const returnIndex = lines.findIndex(line => line.trim().startsWith('return'));
      if (returnIndex !== -1) {
        console.log(`\nReturn statement area (lines ${returnIndex + 1}-${returnIndex + 6}):`);
        lines.slice(returnIndex, returnIndex + 6).forEach((line, idx) => {
          console.log(`${returnIndex + idx + 1}: ${line}`);
        });
      }
    } else {
      console.log(`✅ ${pagePath} already has ResponsiveLayout`);
    }
  } else {
    console.log(`❌ ${pagePath} not found`);
  }
});

console.log('\n=== Summary ===');
console.log('Pages that need ResponsiveLayout updates will be shown above.');
console.log('Pages with ✅ are already updated.');