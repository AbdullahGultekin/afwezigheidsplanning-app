// Test script dat EXACT dezelfde logica gebruikt als main-simple.js
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dataFolder = path.join(__dirname, '..', '..', 'data');

console.log('\n' + '='.repeat(100));
console.log('🧪 TESTING EXACT IMPORT LOGIC FROM main-simple.js');
console.log('='.repeat(100));

function testExactImportLogic(filePath, importType) {
  console.log('\n' + '='.repeat(100));
  console.log(`📄 Testing ${importType}:`, path.basename(filePath));
  console.log('='.repeat(100));
  
  try {
    // Simulate exact reading as in main-simple.js
    const wb = XLSX.readFile(filePath, { cellDates: false, cellNF: false, cellText: false });
    const firstSheetName = wb.SheetNames[0];
    const worksheet = wb.Sheets[firstSheetName];
    
    // EXACT same as main-simple.js line 134
    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '', header: 1 });
    
    console.log('Sheet:', firstSheetName);
    console.log('rawData.length:', rawData.length);
    console.log('First 5 rows preview:');
    rawData.slice(0, 5).forEach((row, idx) => {
      console.log(`  Row ${idx}:`, Array.isArray(row) ? `Array(${row.length} items)` : typeof row);
    });
    
    if (importType === 'kilometers') {
      // EXACT logic from main-simple.js lines 315-376
      let isMonthlyGridFormat = false;
      
      // Check row 5 (index 5) specifically
      console.log('\n--- Checking row 5 ---');
      if (rawData.length > 5 && Array.isArray(rawData[5])) {
        const row5 = rawData[5];
        console.log('Row 5 is array with length:', row5.length);
        let hasNaamWerknemer = false;
        let dayCount = 0;
        
        for (let j = 0; j < row5.length; j++) {
          const cell = row5[j];
          // EXACT condition from main-simple.js line 323
          if (!cell || cell === '') continue;
          
          const cellStr = cell.toString().toLowerCase().trim();
          
          // EXACT condition from main-simple.js line 328
          if (cellStr.includes('naam') && cellStr.includes('werknemer')) {
            hasNaamWerknemer = true;
            console.log(`  ✓ Found "Naam werknemer" at column ${j}: "${cell}"`);
          }
          
          // EXACT condition from main-simple.js lines 333-336
          const cellNum = parseInt(cellStr);
          if (!isNaN(cellNum) && cellNum >= 1 && cellNum <= 31 && cellStr === String(cellNum)) {
            dayCount++;
          }
        }
        
        console.log(`  hasNaamWerknemer: ${hasNaamWerknemer}, dayCount: ${dayCount}`);
        
        // EXACT condition from main-simple.js line 340
        if (hasNaamWerknemer && dayCount >= 10) {
          isMonthlyGridFormat = true;
          console.log(`  ✅ DETECTED: Monthly grid format at row 5 (found ${dayCount} day columns)`);
        } else {
          console.log(`  ❌ NOT DETECTED: hasNaamWerknemer=${hasNaamWerknemer}, dayCount=${dayCount} (< 10 required)`);
        }
      } else {
        console.log('  ❌ Row 5 is not an array or doesn\'t exist');
        if (rawData.length <= 5) {
          console.log(`    rawData.length (${rawData.length}) is <= 5`);
        } else if (!Array.isArray(rawData[5])) {
          console.log(`    rawData[5] is not an array, type: ${typeof rawData[5]}`);
        }
      }
      
      // Fallback check
      if (!isMonthlyGridFormat) {
        console.log('\n--- Fallback: checking rows 3-7 ---');
        for (let i = 3; i < Math.min(8, rawData.length); i++) {
          const row = rawData[i];
          if (!Array.isArray(row)) {
            console.log(`  Row ${i}: not an array`);
            continue;
          }
          
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
          
          console.log(`  Row ${i}: hasNaam=${hasNaam}, dayCount=${dayCount}`);
          
          if (hasNaam && dayCount >= 10) {
            isMonthlyGridFormat = true;
            console.log(`  ✅ DETECTED: Monthly grid format at row ${i}`);
            break;
          }
        }
      }
      
      console.log('\n--- RESULT ---');
      if (isMonthlyGridFormat) {
        console.log('✅ SUCCESS: Would use importMonthlyGridFormatKm()');
      } else {
        console.log('❌ FAILED: Would use standard format import (which will fail)');
      }
    }
    
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    console.error(err.stack);
  }
}

// Test kilometers
const kmFile = path.join(dataFolder, 'Kilometer2025.xlsx');
if (fs.existsSync(kmFile)) {
  testExactImportLogic(kmFile, 'kilometers');
} else {
  console.log('\n❌ Kilometer2025.xlsx not found');
}

console.log('\n' + '='.repeat(100) + '\n');



