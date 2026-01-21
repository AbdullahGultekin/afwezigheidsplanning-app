// Run this from afwezigheidsplanning-app directory: node ../scripts/analyze-excel-files.js
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Adjust path based on where script is run from
const dataDir = path.join(__dirname, '..', 'data');

console.log('\n' + '='.repeat(80));
console.log('📊 EXCEL BESTANDEN ANALYSE');
console.log('='.repeat(80));

// Analyze Kilometer2026.xlsx
const kmFile = path.join(dataDir, 'Kilometer2026.xlsx');
if (fs.existsSync(kmFile)) {
  console.log('\n\n📄 BESTAND 1: Kilometer2026.xlsx');
  console.log('-'.repeat(80));
  
  const wb = XLSX.readFile(kmFile);
  console.log(`Sheets: ${wb.SheetNames.join(', ')}`);
  
  const firstSheet = wb.Sheets[wb.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(firstSheet, { defval: '', header: 1 });
  
  console.log(`\nTotaal rijen: ${rawData.length}`);
  console.log('\nEerste 15 rijen:');
  rawData.slice(0, 15).forEach((row, i) => {
    const displayRow = Array.isArray(row) 
      ? row.map(c => c ? String(c).substring(0, 20) : '').slice(0, 10).join(' | ')
      : JSON.stringify(row).substring(0, 200);
    console.log(`Row ${i}:`, displayRow);
  });
  
  // Find header row (should be around row 5 based on previous analysis)
  console.log('\n🔍 Header detectie:');
  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const row = rawData[i];
    if (Array.isArray(row)) {
      const rowStr = row.map(c => c ? String(c).toLowerCase() : '').join(' ');
      if (rowStr.includes('naam') && rowStr.includes('werknemer')) {
        console.log(`  ✓ Header gevonden op row ${i}:`, row.filter(c => c).join(' | '));
      }
    }
  }
}

// Analyze Werknemersafwezigheidsplanning2026.xlsm
const urenFile = path.join(dataDir, 'Werknemersafwezigheidsplanning2026.xlsm');
if (fs.existsSync(urenFile)) {
  console.log('\n\n📄 BESTAND 2: Werknemersafwezigheidsplanning2026.xlsm');
  console.log('-'.repeat(80));
  
  const wb = XLSX.readFile(urenFile);
  console.log(`Sheets: ${wb.SheetNames.join(', ')}`);
  
  const januariSheet = wb.Sheets['Januari'] || wb.Sheets[wb.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(januariSheet, { defval: '', header: 1 });
  
  console.log(`\nTotaal rijen: ${rawData.length}`);
  console.log('\nEerste 15 rijen:');
  rawData.slice(0, 15).forEach((row, i) => {
    const displayRow = Array.isArray(row) 
      ? row.map(c => c ? String(c).substring(0, 15) : '').slice(0, 12).join(' | ')
      : JSON.stringify(row).substring(0, 200);
    console.log(`Row ${i}:`, displayRow);
  });
  
  // Find header row
  console.log('\n🔍 Header detectie:');
  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const row = rawData[i];
    if (Array.isArray(row)) {
      const rowStr = row.map(c => c ? String(c).toLowerCase() : '').join(' ');
      if ((rowStr.includes('naam') && rowStr.includes('werknemer')) || 
          (row.filter(c => c && !isNaN(c) && parseInt(c) >= 1 && parseInt(c) <= 31).length > 5)) {
        console.log(`  ✓ Header gevonden op row ${i}:`, row.filter(c => c).slice(0, 10).join(' | '));
      }
    }
  }
}

console.log('\n' + '='.repeat(80) + '\n');



