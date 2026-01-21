const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Analyze specific Excel files from desktop
const desktopPath = path.join('C:', 'Users', 'abdul', 'OneDrive', 'Bureaublad');
const files = [
  path.join(desktopPath, 'Kilometer2026.xlsx'),
  path.join(desktopPath, 'Werknemersafwezigheidsplanning2026.xlsm')
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`\n❌ File not found: ${filePath}`);
    return;
  }

  console.log(`\n${'='.repeat(100)}`);
  console.log(`📄 ANALYZING: ${path.basename(filePath)}`);
  console.log(`   Path: ${filePath}`);
  console.log('='.repeat(100));

  try {
    const workbook = XLSX.readFile(filePath, { cellDates: false, cellNF: false, cellText: false });
    
    console.log(`\n📊 Sheets: ${workbook.SheetNames.join(', ')}`);
    
    // Analyze first sheet (usually the month)
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Get all cell addresses to understand structure
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    console.log(`\n📏 Range: ${worksheet['!ref']}`);
    console.log(`   Rows: ${range.e.r + 1}, Cols: ${range.e.c + 1}`);
    
    // Read as array of arrays (raw data)
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: null,
      raw: false 
    });
    
    console.log(`\n📋 Total rows in raw data: ${rawData.length}`);
    
    // Show first 15 rows with all their values
    console.log(`\n📝 First 15 rows (showing all columns with values):`);
    for (let i = 0; i < Math.min(15, rawData.length); i++) {
      const row = rawData[i];
      if (!Array.isArray(row)) {
        console.log(`Row ${i}:`, row);
        continue;
      }
      
      // Find all non-empty cells in this row
      const nonEmptyCells = [];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell !== null && cell !== undefined && cell !== '') {
          const cellStr = String(cell).trim();
          if (cellStr) {
            nonEmptyCells.push(`[${j}]:${cellStr.substring(0, 30)}`);
          }
        }
      }
      
      if (nonEmptyCells.length > 0) {
        console.log(`Row ${i}: ${nonEmptyCells.join(' | ')}`);
      } else {
        console.log(`Row ${i}: (empty)`);
      }
    }
    
    // Try to find header row
    console.log(`\n🔍 Looking for header row:`);
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      if (!Array.isArray(row)) continue;
      
      // Check for common header patterns
      let hasHeaderKeywords = false;
      let headerCells = [];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell !== null && cell !== undefined && cell !== '') {
          const cellStr = String(cell).toLowerCase().trim();
          if (cellStr.includes('naam') || cellStr.includes('werknemer') || 
              cellStr.includes('datum') || cellStr.includes('kilometer') ||
              cellStr.includes('km') || cellStr.includes('uren') ||
              (!isNaN(cellStr) && parseInt(cellStr) >= 1 && parseInt(cellStr) <= 31)) {
            hasHeaderKeywords = true;
            headerCells.push(`Col${j}:"${String(row[j]).substring(0, 40)}"`);
          }
        }
      }
      
      if (hasHeaderKeywords && headerCells.length >= 3) {
        console.log(`  ✓ Potential header row ${i}: ${headerCells.join(' | ')}`);
      }
    }
    
    // Also try default JSON conversion to see what it gives
    const defaultJson = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
    if (defaultJson.length > 0) {
      console.log(`\n📊 Default JSON conversion (first row columns):`);
      console.log(`   Columns: ${Object.keys(defaultJson[0]).join(', ')}`);
      console.log(`   First row:`, JSON.stringify(defaultJson[0], null, 2).substring(0, 400));
    } else {
      console.log(`\n⚠️  Default JSON conversion returned 0 rows`);
    }
    
  } catch (error) {
    console.error(`\n❌ Error:`, error.message);
    console.error(error.stack);
  }
});

console.log(`\n${'='.repeat(100)}\n`);



