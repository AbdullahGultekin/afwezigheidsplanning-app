const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Analyze Excel files
const files = [
  path.join(__dirname, '../data/Kilometer2026.xlsx'),
  path.join(__dirname, '../data/Werknemersafwezigheidsplanning2026.xlsm')
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`\n❌ Bestand niet gevonden: ${filePath}`);
    return;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📄 Analyseren: ${path.basename(filePath)}`);
  console.log('='.repeat(80));

  try {
    const workbook = XLSX.readFile(filePath);
    
    console.log(`\n📊 Aantal sheets: ${workbook.SheetNames.length}`);
    console.log(`Sheet namen: ${workbook.SheetNames.join(', ')}`);
    
    workbook.SheetNames.forEach((sheetName, idx) => {
      console.log(`\n${'-'.repeat(80)}`);
      console.log(`📋 Sheet ${idx + 1}: "${sheetName}"`);
      console.log('-'.repeat(80));
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Get raw data as array
      const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '', header: 1 });
      
      console.log(`\nTotaal rijen: ${rawData.length}`);
      
      // Show first 15 rows
      console.log(`\n📝 Eerste 15 rijen (raw data):`);
      rawData.slice(0, 15).forEach((row, i) => {
        console.log(`Row ${i}:`, Array.isArray(row) ? row.map(c => c ? String(c).substring(0, 30) : '').join(' | ') : JSON.stringify(row).substring(0, 200));
      });
      
      // Try default JSON conversion
      const defaultJson = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
      
      if (defaultJson.length > 0) {
        console.log(`\n📋 Kolomnamen (default conversion):`);
        console.log(Object.keys(defaultJson[0]).join(', '));
        
        console.log(`\n📝 Eerste 3 rijen (JSON format):`);
        defaultJson.slice(0, 3).forEach((row, i) => {
          console.log(`Row ${i + 1}:`, JSON.stringify(row, null, 2).substring(0, 500));
        });
      }
      
      // Try to detect header row
      console.log(`\n🔍 Header detectie:`);
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const row = rawData[i];
        if (Array.isArray(row)) {
          const rowStr = row.map(c => c ? String(c).toLowerCase() : '').join(' ');
          const keywords = ['werknemer', 'naam', 'datum', 'kilometer', 'uren', 'btw', 'gratis', 'verkocht'];
          const hasKeywords = keywords.some(kw => rowStr.includes(kw));
          
          if (hasKeywords || row.filter(c => c && String(c).trim() !== '').length >= 3) {
            console.log(`  Row ${i} (mogelijk header):`, row.map(c => c ? String(c).substring(0, 20) : '').join(' | '));
          }
        }
      }
    });
    
  } catch (error) {
    console.error(`❌ Fout bij lezen van ${path.basename(filePath)}:`, error.message);
  }
});

console.log(`\n${'='.repeat(80)}\n`);



