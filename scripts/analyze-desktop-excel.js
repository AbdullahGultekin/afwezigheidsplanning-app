// Run from afwezigheidsplanning-app directory
const XLSX = require('./afwezigheidsplanning-app/node_modules/xlsx');
const path = require('path');
const fs = require('fs');

const desktopPath = 'C:/Users/abdul/OneDrive/Bureaublad';

console.log('\n' + '='.repeat(100));
console.log('ANALYZING EXCEL FILES FROM DESKTOP');
console.log('Path:', desktopPath);
console.log('='.repeat(100));

try {
  const files = fs.readdirSync(desktopPath).filter(f => 
    (f.endsWith('.xlsx') || f.endsWith('.xlsm')) && 
    (f.includes('Kilometer') || f.includes('Werknemersafwezigheidsplanning'))
  ).slice(0, 3);
  
  console.log('\nRelevant files found:', files);
  
  files.forEach(fileName => {
    const fullPath = path.join(desktopPath, fileName);
    
    console.log('\n' + '='.repeat(100));
    console.log('FILE:', fileName);
    console.log('='.repeat(100));
    
    try {
      const wb = XLSX.readFile(fullPath, { cellDates: false, cellNF: false, cellText: false });
      console.log('Sheets:', wb.SheetNames.join(', '));
      
      const ws = wb.Sheets[wb.SheetNames[0]];
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      console.log('Range:', ws['!ref'], '| Rows:', range.e.r + 1, '| Cols:', range.e.c + 1);
      
      // Read as raw array
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: false });
      console.log('Total rows in raw data:', raw.length);
      
      console.log('\n--- DETAILED ROW ANALYSIS ---');
      for (let i = 0; i < Math.min(20, raw.length); i++) {
        const row = raw[i];
        if (!Array.isArray(row)) continue;
        
        const cells = [];
        for (let j = 0; j < Math.min(row.length, 60); j++) {
          const val = row[j];
          if (val !== null && val !== undefined && val !== '') {
            const str = String(val).trim();
            if (str) {
              cells.push(`Col${j}:"${str.substring(0, 40)}"`);
            }
          }
        }
        
        if (cells.length > 0) {
          console.log(`Row ${i}: ${cells.join(' | ')}`);
        }
      }
      
      // Try default conversion
      const defaultJson = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
      if (defaultJson.length > 0) {
        console.log('\n--- DEFAULT JSON CONVERSION ---');
        console.log('First row columns:', Object.keys(defaultJson[0]).join(', '));
        console.log('First row sample:', JSON.stringify(defaultJson[0], null, 2).substring(0, 500));
      }
      
    } catch (err) {
      console.error('ERROR reading file:', err.message);
    }
  });
  
} catch (err) {
  console.error('ERROR accessing desktop:', err.message);
}

console.log('\n' + '='.repeat(100) + '\n');

