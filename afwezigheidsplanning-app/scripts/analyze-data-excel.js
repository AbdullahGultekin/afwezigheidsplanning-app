// Script om Excel bestanden in de data folder te analyseren
// Run: cd afwezigheidsplanning-app && node scripts/analyze-data-excel.js

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dataFolder = path.join(__dirname, '..', '..', 'data');

console.log('\n' + '='.repeat(100));
console.log('📊 ANALYZING EXCEL FILES IN DATA FOLDER');
console.log('Path:', dataFolder);
console.log('='.repeat(100));

if (!fs.existsSync(dataFolder)) {
  console.log('❌ Data folder does not exist:', dataFolder);
  console.log('💡 Create the data folder and place Excel files there');
  process.exit(1);
}

const files = fs.readdirSync(dataFolder).filter(f => 
  f.endsWith('.xlsx') || f.endsWith('.xlsm') || f.endsWith('.xls')
);

if (files.length === 0) {
  console.log('\n⚠️  No Excel files found in data folder');
  console.log('💡 Place Excel files (.xlsx, .xlsm, .xls) in:', dataFolder);
  process.exit(0);
}

console.log('\n📁 Files found in data folder:', files.length);
files.forEach(f => {
  const fullPath = path.join(dataFolder, f);
  const stats = fs.statSync(fullPath);
  console.log(`  ✓ ${f} (${(stats.size / 1024).toFixed(2)} KB)`);
});

files.forEach(fileName => {
  const fullPath = path.join(dataFolder, fileName);
  
  console.log('\n' + '='.repeat(100));
  console.log('📄 FILE:', fileName);
  console.log('='.repeat(100));
  
  try {
    const wb = XLSX.readFile(fullPath, { cellDates: false, cellNF: false, cellText: false });
    console.log('📊 Sheets:', wb.SheetNames.join(', '));
    
    // Analyze first sheet
    const ws = wb.Sheets[wb.SheetNames[0]];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    console.log('📏 Range:', ws['!ref'], '| Rows:', range.e.r + 1, '| Cols:', range.e.c + 1);
    
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: false });
    console.log('📋 Total rows in raw data:', raw.length);
    
    console.log('\n--- ROW ANALYSIS (showing rows with data) ---');
    for (let i = 0; i < Math.min(20, raw.length); i++) {
      const row = raw[i];
      if (!Array.isArray(row)) continue;
      
      const cells = [];
      for (let j = 0; j < Math.min(row.length, 60); j++) {
        const val = row[j];
        if (val !== null && val !== undefined && val !== '') {
          const str = String(val).trim();
          if (str) {
            cells.push(`[${j}]"${str.substring(0, 40)}"`);
          }
        }
      }
      
      if (cells.length > 0) {
        console.log(`Row ${i}: ${cells.join(' | ')}`);
      }
    }
    
    // Check for header row (row 5 typically)
    console.log('\n--- 🔍 HEADER ROW DETECTION ---');
    for (let i = 0; i < Math.min(10, raw.length); i++) {
      const row = raw[i];
      if (!Array.isArray(row)) continue;
      
      let hasNaam = false;
      let dayCount = 0;
      const dayNumbers = [];
      
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (!cell || cell === '') continue;
        
        const cellStr = cell.toString().toLowerCase().trim();
        if (cellStr.includes('naam') && cellStr.includes('werknemer')) {
          hasNaam = true;
        }
        
        const cellNum = parseInt(cellStr);
        if (!isNaN(cellNum) && cellNum >= 1 && cellNum <= 31 && cellStr === String(cellNum)) {
          dayCount++;
          dayNumbers.push(cellNum);
        }
      }
      
      if (hasNaam || dayCount > 0) {
        console.log(`  Row ${i}: hasNaam=${hasNaam}, dayCount=${dayCount}, days=[${dayNumbers.slice(0, 10).join(',')}${dayNumbers.length > 10 ? '...' : ''}]`);
      }
    }
    
  } catch (err) {
    console.error('❌ ERROR reading file:', err.message);
  }
});

console.log('\n' + '='.repeat(100));
console.log('\n💡 TIP: Plaats Excel bestanden in de data folder om ze hier te analyseren');
console.log('   📁 Path:', dataFolder);
console.log('   📝 Supported formats: .xlsx, .xlsm, .xls');
console.log('='.repeat(100) + '\n');



