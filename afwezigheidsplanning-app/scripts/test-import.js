// Test script om import logica te testen met echte Excel bestanden
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dataFolder = path.join(__dirname, '..', '..', 'data');

console.log('\n' + '='.repeat(100));
console.log('🧪 TESTING IMPORT LOGIC WITH REAL EXCEL FILES');
console.log('='.repeat(100));

// Simulate the import logic for kilometers
function testKilometerImport(filePath) {
  console.log('\n' + '='.repeat(100));
  console.log('📄 Testing:', path.basename(filePath));
  console.log('='.repeat(100));
  
  try {
    const wb = XLSX.readFile(filePath, { cellDates: false, cellNF: false, cellText: false });
    const firstSheetName = wb.SheetNames[0];
    const ws = wb.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json(ws, { defval: '', header: 1 });
    
    console.log('Sheet:', firstSheetName);
    console.log('Total rows:', rawData.length);
    
    // Simulate the detection logic from main-simple.js
    let isMonthlyGridFormat = false;
    let detectedRow = -1;
    
    // Check row 5 specifically
    if (rawData.length > 5 && Array.isArray(rawData[5])) {
      const row5 = rawData[5];
      let hasNaamWerknemer = false;
      let dayCount = 0;
      const dayNumbers = [];
      
      for (let j = 0; j < row5.length; j++) {
        const cell = row5[j];
        if (!cell || cell === '') continue;
        
        const cellStr = cell.toString().toLowerCase().trim();
        
        if (cellStr.includes('naam') && cellStr.includes('werknemer')) {
          hasNaamWerknemer = true;
          console.log(`  ✓ Found "Naam werknemer" at column ${j}: "${cell}"`);
        }
        
        const cellNum = parseInt(cellStr);
        if (!isNaN(cellNum) && cellNum >= 1 && cellNum <= 31 && cellStr === String(cellNum)) {
          dayCount++;
          dayNumbers.push(cellNum);
        }
      }
      
      if (hasNaamWerknemer && dayCount >= 10) {
        isMonthlyGridFormat = true;
        detectedRow = 5;
        console.log(`  ✓ Detected monthly grid format at row 5 (found ${dayCount} day columns)`);
        console.log(`    Day numbers: [${dayNumbers.slice(0, 10).join(',')}${dayNumbers.length > 10 ? '...' : ''}]`);
      }
    }
    
    // Fallback check rows 3-7
    if (!isMonthlyGridFormat) {
      for (let i = 3; i < Math.min(8, rawData.length); i++) {
        const row = rawData[i];
        if (!Array.isArray(row)) continue;
        
        let hasNaam = false;
        let dayCount = 0;
        
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
          }
        }
        
        if (hasNaam && dayCount >= 10) {
          isMonthlyGridFormat = true;
          detectedRow = i;
          console.log(`  ✓ Detected monthly grid format at row ${i} (found ${dayCount} day columns)`);
          break;
        }
      }
    }
    
    if (!isMonthlyGridFormat) {
      console.log('  ❌ Could NOT detect monthly grid format');
      console.log('  Showing first 10 rows for debugging:');
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const row = rawData[i];
        if (Array.isArray(row)) {
          const cells = [];
          for (let j = 0; j < Math.min(row.length, 15); j++) {
            const val = row[j];
            if (val !== null && val !== undefined && val !== '') {
              cells.push(`[${j}]"${String(val).substring(0, 20)}"`);
            }
          }
          if (cells.length > 0) {
            console.log(`    Row ${i}: ${cells.join(' | ')}`);
          }
        }
      }
    } else {
      console.log(`  ✅ SUCCESS: Detected as monthly grid format at row ${detectedRow}`);
      
      // Test data extraction
      const headerRow = rawData[detectedRow];
      let nameColIndex = -1;
      const dayCols = [];
      
      for (let j = 0; j < headerRow.length; j++) {
        const cell = headerRow[j];
        if (!cell || cell === '') continue;
        const cellStr = cell.toString().toLowerCase().trim();
        if (cellStr.includes('naam') && cellStr.includes('werknemer')) {
          nameColIndex = j;
        }
        const dayNum = parseInt(cellStr);
        if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31 && cellStr === String(dayNum)) {
          dayCols.push({ index: j, dayNumber: dayNum });
        }
      }
      
      console.log(`  Name column index: ${nameColIndex}`);
      console.log(`  Day columns found: ${dayCols.length}`);
      
      // Test first data row
      if (rawData.length > detectedRow + 1) {
        const dataRow = rawData[detectedRow + 1];
        const werknemerNaam = dataRow[nameColIndex];
        console.log(`  First werknemer name: "${werknemerNaam}"`);
        
        // Count non-empty km values in first few day columns
        let kmValues = 0;
        for (let i = 0; i < Math.min(5, dayCols.length); i++) {
          const dayCol = dayCols[i];
          const cellValue = dataRow[dayCol.index];
          if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
            const km = parseFloat(cellValue);
            if (!isNaN(km) && km > 0) {
              kmValues++;
              console.log(`    Day ${dayCol.dayNumber}: ${km} km`);
            }
          }
        }
        console.log(`  Found ${kmValues} non-zero kilometer values in first 5 days`);
      }
    }
    
  } catch (err) {
    console.error('  ❌ ERROR:', err.message);
  }
}

// Test kilometers file
const kmFile = path.join(dataFolder, 'Kilometer2025.xlsx');
if (fs.existsSync(kmFile)) {
  testKilometerImport(kmFile);
} else {
  console.log('\n❌ Kilometer2025.xlsx not found');
}

// Test uren file
function testUrenImport(filePath) {
  console.log('\n' + '='.repeat(100));
  console.log('📄 Testing:', path.basename(filePath));
  console.log('='.repeat(100));
  
  try {
    const wb = XLSX.readFile(filePath, { cellDates: false, cellNF: false, cellText: false });
    const firstSheetName = wb.SheetNames[0];
    const ws = wb.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json(ws, { defval: '', header: 1 });
    
    console.log('Sheet:', firstSheetName);
    console.log('Total rows:', rawData.length);
    
    // Check for monthly grid format (same logic as kilometers)
    let isMonthlyGridFormat = false;
    let detectedRow = -1;
    
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      if (!Array.isArray(row)) continue;
      
      let hasNaamWerknemer = false;
      let dayCount = 0;
      
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (!cell || cell === '') continue;
        
        const cellStr = cell.toString().toLowerCase().trim();
        if (cellStr.includes('naam') && cellStr.includes('werknemer')) {
          hasNaamWerknemer = true;
        }
        
        const cellNum = parseInt(cellStr);
        if (!isNaN(cellNum) && cellNum >= 1 && cellNum <= 31 && cellStr === String(cellNum)) {
          dayCount++;
        }
      }
      
      if (hasNaamWerknemer && dayCount >= 10) {
        isMonthlyGridFormat = true;
        detectedRow = i;
        console.log(`  ✓ Detected monthly grid format at row ${i} (found ${dayCount} day columns)`);
        break;
      }
    }
    
    if (!isMonthlyGridFormat) {
      console.log('  ❌ Could NOT detect monthly grid format');
    } else {
      console.log(`  ✅ SUCCESS: Detected as monthly grid format at row ${detectedRow}`);
    }
    
  } catch (err) {
    console.error('  ❌ ERROR:', err.message);
  }
}

const urenFile = path.join(dataFolder, 'Werknemersafwezigheidsplanning2025.xlsx');
if (fs.existsSync(urenFile)) {
  testUrenImport(urenFile);
} else {
  console.log('\n❌ Werknemersafwezigheidsplanning2025.xlsx not found');
}

console.log('\n' + '='.repeat(100) + '\n');



