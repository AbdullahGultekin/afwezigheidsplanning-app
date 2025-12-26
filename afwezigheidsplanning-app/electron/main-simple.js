const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initDatabase, databaseOps } = require('./database-simple');
const XLSX = require('xlsx');

// Initialize database
initDatabase();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload-simple.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../app-simple/index.html'));

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  // Log console messages from main process to renderer
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[Main Process] ${message}`);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Database handlers - simple table-based operations
const dbTableMap = {
  werknemers: databaseOps,
  uren: databaseOps,
  afwezigheden: databaseOps,
  kilometers: databaseOps,
  maandKmStanden: databaseOps
};

ipcMain.handle('db:get', async (event, table) => {
  switch(table) {
    case 'werknemers': return databaseOps.getWerknemers();
    case 'uren': return databaseOps.getUren();
    case 'afwezigheden': return databaseOps.getAfwezigheden();
    case 'kilometers': return databaseOps.getKilometers();
    case 'maandKmStanden': return databaseOps.getMaandKmStanden();
    case 'dagontvangsten': return databaseOps.getDagontvangsten();
    case 'gratisCola': return databaseOps.getGratisCola();
    default: return [];
  }
});

ipcMain.handle('db:set', async (event, table, data) => {
  // For compatibility - typically not used in this app
  return { success: true };
});

ipcMain.handle('db:add', async (event, table, item) => {
  switch(table) {
    case 'werknemers': return databaseOps.createWerknemer(item);
    case 'uren': return databaseOps.createUren(item);
    case 'afwezigheden': return databaseOps.createAfwezigheid(item);
    case 'kilometers': return databaseOps.createKilometer(item);
    case 'maandKmStanden': return databaseOps.createMaandKmStand(item);
    case 'dagontvangsten': return databaseOps.createDagontvangst(item);
    case 'gratisCola': return databaseOps.createGratisCola(item);
    default: return null;
  }
});

ipcMain.handle('db:update', async (event, table, id, updates) => {
  switch(table) {
    case 'werknemers': return databaseOps.updateWerknemer(id, updates);
    case 'uren': return databaseOps.updateUren(id, updates);
    case 'afwezigheden': return databaseOps.updateAfwezigheid(id, updates);
    case 'kilometers': return databaseOps.updateKilometer(id, updates);
    case 'maandKmStanden': return databaseOps.updateMaandKmStand(id, updates);
    default: return null;
  }
});

ipcMain.handle('db:delete', async (event, table, id) => {
  switch(table) {
    case 'werknemers': databaseOps.deleteWerknemer(id); break;
    case 'uren': databaseOps.deleteUren(id); break;
    case 'afwezigheden': databaseOps.deleteAfwezigheid(id); break;
    case 'kilometers': databaseOps.deleteKilometer(id); break;
    case 'maandKmStanden': databaseOps.deleteMaandKmStand(id); break;
  }
  return { success: true };
});

// Excel import handlers
ipcMain.handle('import:excel', async (event, base64, fileName, importType) => {
  try {
    const buffer = Buffer.from(base64, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Try default XLSX conversion first to see structure
    const defaultJson = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
    console.log('=== EXCEL STRUCTURE ANALYSIS ===');
    console.log('Import type:', importType);
    if (defaultJson.length > 0) {
      console.log('Default XLSX conversion found', defaultJson.length, 'rows');
      console.log('Default conversion columns:', Object.keys(defaultJson[0]));
      console.log('First row (default):', defaultJson[0]);
    }
    
    // Convert to array format first to inspect structure
    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '', header: 1 });
    console.log('Raw Excel data (first 10 rows):');
    rawData.slice(0, 10).forEach((row, idx) => {
      console.log(`Row ${idx}:`, Array.isArray(row) ? row : Object.keys(row));
    });
    
    // Find the actual header row (usually row with column names)
    let headerRowIndex = -1;
    let headerRow = null;
    
    // Look for common header patterns in first 10 rows
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      if (Array.isArray(row)) {
        // Check if this row looks like headers (contains common column names)
        const rowStr = row.map(c => c ? c.toString().toLowerCase() : '').join(' ');
        // More flexible matching - look for any of these keywords
        if (rowStr.includes('werknemer') || rowStr.includes('naam') || rowStr.includes('medewerker') ||
            rowStr.includes('datum') || rowStr.includes('date') || 
            rowStr.includes('uren') || rowStr.includes('hours') || rowStr.includes('uur') ||
            rowStr.includes('type') || rowStr.includes('afwezigheid') || rowStr.includes('absence') ||
            rowStr.includes('opmerking') || rowStr.includes('comment') || rowStr.includes('note')) {
          headerRowIndex = i;
          headerRow = row.map(h => h ? h.toString().trim() : '');
          console.log('Found header row at index:', i, 'Headers:', headerRow);
          break;
        }
      }
    }
    
    // If no header found, try to detect from structure
    // Sometimes first column is a title, second row might be headers
    if (headerRowIndex === -1 && rawData.length > 1) {
      // Try row 1 (index 1) as headers if row 0 looks like a title
      const firstRow = rawData[0];
      if (Array.isArray(firstRow) && firstRow.length > 0) {
        const firstCell = firstRow[0] ? firstRow[0].toString().toLowerCase() : '';
        // If first row looks like a title (contains "planning", "overzicht", etc), skip it
        if (firstCell.includes('planning') || firstCell.includes('overzicht') || firstCell.includes('sleutel')) {
          if (rawData.length > 1 && Array.isArray(rawData[1])) {
            headerRowIndex = 1;
            headerRow = rawData[1].map(h => h ? h.toString().trim() : '');
            console.log('Detected title row, using row 1 as headers:', headerRow);
          }
        }
      }
    }
    
    // If still no header found, try first row that has multiple columns
    if (headerRowIndex === -1 && rawData.length > 0) {
      for (let i = 0; i < Math.min(5, rawData.length); i++) {
        const row = rawData[i];
        if (Array.isArray(row)) {
          const nonEmptyCount = row.filter(c => c && c.toString().trim() !== '').length;
          if (nonEmptyCount >= 2) { // At least 2 columns
            headerRowIndex = i;
            headerRow = row.map(h => h ? h.toString().trim() : '').filter(h => h !== '');
            console.log('Using first row with multiple columns as headers (row', i, '):', headerRow);
            break;
          }
        }
      }
    }
    
    // Convert to JSON starting from header row
    let jsonData = [];
    if (headerRow && headerRowIndex >= 0 && headerRow.length > 1) {
      // Skip header row and any rows before it, start from headerRowIndex + 1
      for (let i = headerRowIndex + 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (Array.isArray(row)) {
          const obj = {};
          headerRow.forEach((header, idx) => {
            if (header && header.trim() !== '') {
              obj[header] = row[idx] || '';
            }
          });
          // Only add row if it has at least one non-empty value
          if (Object.values(obj).some(v => v !== '' && v !== null && v !== undefined)) {
            jsonData.push(obj);
          }
        }
      }
    }
    
    // Fallback: use default XLSX conversion if we didn't get good results
    if (jsonData.length === 0 && defaultJson.length > 0) {
      console.log('⚠️ Using default XLSX conversion as fallback (could not parse with custom logic)');
      jsonData = defaultJson;
    }
    
    console.log('=== PROCESSED DATA ===');
    console.log('Total data rows after processing:', jsonData.length);
    if (jsonData.length > 0) {
      console.log('Available columns:', Object.keys(jsonData[0]));
      console.log('All column names:', Object.keys(jsonData[0]).join(', '));
      console.log('First 3 rows of processed data:', jsonData.slice(0, 3));
      console.log('First row (formatted):', JSON.stringify(jsonData[0], null, 2));
    } else {
      console.log('WARNING: No data rows found in Excel file!');
      console.log('Trying fallback: using default XLSX conversion...');
      // Try using default XLSX conversion as fallback
      if (defaultJson.length > 0) {
        jsonData = defaultJson;
        console.log('Using default conversion, got', jsonData.length, 'rows');
        console.log('Columns:', Object.keys(jsonData[0]));
      }
    }
    
    if (!jsonData || jsonData.length === 0) {
      return { 
        success: false, 
        error: 'Excel bestand is leeg of heeft geen data'
      };
    }
    
    let imported = {
      werknemers: 0,
      kilometers: 0,
      uren: 0
    };
    
    // Helper function to find column value with flexible matching
    function findColumnValue(row, possibleNames) {
      for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
          return row[name];
        }
      }
      // Try case-insensitive matching
      const rowKeys = Object.keys(row);
      for (const name of possibleNames) {
        const found = rowKeys.find(key => key.toLowerCase() === name.toLowerCase());
        if (found && row[found] !== undefined && row[found] !== null && row[found] !== '') {
          return row[found];
        }
      }
      // Try first column if no match
      return rowKeys.length > 0 ? row[rowKeys[0]] : '';
    }
    
    // Process based on import type
    console.log('Processing import type:', importType);
    
    if (importType === 'werknemers') {
      // Expected columns: Naam, Email, Nummerplaat (optional)
      console.log('Importing werknemers, total rows:', jsonData.length);
      console.log('First row sample:', JSON.stringify(jsonData[0]));
      
      for (const row of jsonData) {
        // Try multiple column name variations
        const naam = findColumnValue(row, ['Naam', 'naam', 'NAAM', 'Name', 'name', 'NAME']);
        
        if (!naam || naam.toString().trim() === '') {
          console.log('Skipping row - no naam found:', JSON.stringify(row));
          continue;
        }
        
        try {
          const email = findColumnValue(row, ['Email', 'email', 'EMAIL', 'E-mail', 'e-mail']) || '';
          const nummerplaat = findColumnValue(row, ['Nummerplaat', 'nummerplaat', 'NUMMERPLAAT', 
                                                    'Nummerplaat', 'Nummer', 'nummer', 'License', 'license']) || '';
          
          databaseOps.createWerknemer({
            naam: naam.toString().trim(),
            email: email.toString().trim() || null,
            nummerplaat: nummerplaat.toString().trim() || null
          });
          imported.werknemers++;
          console.log('Imported werknemer:', naam);
        } catch (err) {
          console.error('Error importing werknemer:', err, row);
        }
      }
    } else if (importType === 'kilometers') {
      // Expected columns: Werknemer/Naam, Datum, Kilometers, Van (optional), Naar (optional), Doel (optional)
      const werknemers = databaseOps.getWerknemers();
      
      console.log('Importing kilometers, total rows:', jsonData.length);
      console.log('Available werknemers:', werknemers.length);
      if (jsonData.length > 0) {
        console.log('First row sample:', JSON.stringify(jsonData[0]));
      }
      
      for (const row of jsonData) {
        const werknemerNaam = (findColumnValue(row, ['Werknemer', 'werknemer', 'Naam', 'naam', 'Name', 'name', 
                                                      'Employee', 'employee']) || '').toString().trim();
        const datum = findColumnValue(row, ['Datum', 'datum', 'DATUM', 'Date', 'date', 'DATE']) || '';
        const kmValue = findColumnValue(row, ['Kilometers', 'kilometers', 'KILOMETERS', 'KM', 'km', 
                                              'Distance', 'distance', 'Afstand', 'afstand']) || 0;
        const kilometers = parseFloat(kmValue);
        
        if (!werknemerNaam || !datum || isNaN(kilometers) || kilometers <= 0) {
          console.log('Skipping row - missing data:', { werknemerNaam, datum, kilometers, row });
          continue;
        }
        
        // Find werknemer by name
        const werknemer = werknemers.find(w => w.naam.toLowerCase() === werknemerNaam.toLowerCase());
        if (!werknemer) {
          console.log('Werknemer not found:', werknemerNaam, 'Available:', werknemers.map(w => w.naam));
          continue;
        }
        
        try {
          // Parse date (supports various formats)
          let dateObj;
          if (datum instanceof Date) {
            dateObj = datum;
          } else if (typeof datum === 'number') {
            // Excel serial date number (days since 1900-01-01)
            dateObj = new Date((datum - 25569) * 86400 * 1000);
          } else if (typeof datum === 'string') {
            // Try parsing as ISO date or other formats
            dateObj = new Date(datum);
            // If that fails, try Excel date string format
            if (isNaN(dateObj.getTime()) && datum.match(/^\d{5}$/)) {
              const excelDate = parseFloat(datum);
              dateObj = new Date((excelDate - 25569) * 86400 * 1000);
            }
          } else {
            dateObj = new Date(datum);
          }
          
          if (!dateObj || isNaN(dateObj.getTime())) continue;
          
          const vanAdres = findColumnValue(row, ['Van', 'van', 'From', 'from', 'Van adres', 'van adres']) || '';
          const naarAdres = findColumnValue(row, ['Naar', 'naar', 'To', 'to', 'Naar adres', 'naar adres']) || '';
          const doel = findColumnValue(row, ['Doel', 'doel', 'Purpose', 'purpose', 'Doel/reden', 'doel/reden']) || '';
          
          databaseOps.createKilometer({
            werknemerId: werknemer.id,
            datum: dateObj.toISOString(),
            kilometers: kilometers,
            vanAdres: vanAdres.toString().trim() || null,
            naarAdres: naarAdres.toString().trim() || null,
            doel: doel.toString().trim() || null
          });
          imported.kilometers++;
          console.log('Imported kilometer:', werknemerNaam, kilometers, 'km');
        } catch (err) {
          console.error('Error importing kilometer:', err, row);
        }
      }
    } else if (importType === 'uren') {
      // Expected columns: Werknemer/Naam, Datum, Uren, Opmerking (optional)
      const werknemers = databaseOps.getWerknemers();
      console.log('Importing uren, total rows:', jsonData.length);
      console.log('Available werknemers:', werknemers.length);
      console.log('First row sample:', JSON.stringify(jsonData[0]));
      
      for (const row of jsonData) {
        // Try multiple column name variations
        const werknemerNaam = (findColumnValue(row, ['Werknemer', 'werknemer', 'Naam', 'naam', 'Name', 'name', 
                                                      'Employee', 'employee']) || '').toString().trim();
        const datum = findColumnValue(row, ['Datum', 'datum', 'DATUM', 'Date', 'date', 'DATE']) || '';
        const urenValue = findColumnValue(row, ['Uren', 'uren', 'UREN', 'Hours', 'hours', 'HOURS', 'Uur', 'uur']) || 0;
        const uren = parseFloat(urenValue);
        
        if (!werknemerNaam || !datum || isNaN(uren) || uren <= 0) {
          console.log('Skipping row - missing data:', { werknemerNaam, datum, uren, row });
          continue;
        }
        
        // Find werknemer by name
        const werknemer = werknemers.find(w => w.naam.toLowerCase() === werknemerNaam.toLowerCase());
        if (!werknemer) {
          console.log('Werknemer not found:', werknemerNaam, 'Available:', werknemers.map(w => w.naam));
          continue;
        }
        
        try {
          // Parse date (supports various formats)
          let dateObj;
          if (datum instanceof Date) {
            dateObj = datum;
          } else if (typeof datum === 'number') {
            // Excel serial date number (days since 1900-01-01)
            dateObj = new Date((datum - 25569) * 86400 * 1000);
          } else if (typeof datum === 'string') {
            // Try parsing as ISO date or other formats
            dateObj = new Date(datum);
            // If that fails, try Excel date string format
            if (isNaN(dateObj.getTime()) && datum.match(/^\d+(\.\d+)?$/)) {
              const excelDate = parseFloat(datum);
              dateObj = new Date((excelDate - 25569) * 86400 * 1000);
            }
          } else {
            dateObj = new Date(datum);
          }
          
          if (!dateObj || isNaN(dateObj.getTime())) continue;
          
          const opmerking = findColumnValue(row, ['Opmerking', 'opmerking', 'Comment', 'comment', 
                                                   'Notitie', 'notitie', 'Note', 'note']) || '';
          
          databaseOps.createUren({
            werknemerId: werknemer.id,
            datum: dateObj.toISOString(),
            uren: uren,
            opmerking: opmerking.toString().trim() || null
          });
          imported.uren++;
          console.log('Imported uren:', werknemerNaam, uren, 'uren');
        } catch (err) {
          console.error('Error importing uren:', err, row);
        }
      }
    } else if (importType === 'uren-afwezigheden' || importType === 'afwezigheden') {
      // Special handling for Werknemersafwezigheidsplanning format
      // Structure: Row 5 has headers ("Naam van werknemer", "1", "2", ..., "31", "Totaal")
      // Data starts from row 6
      // Each day cell can contain: number (uren) or letter (afwezigheid type: V, A, P, Z, S)
      
      const werknemers = databaseOps.getWerknemers();
      console.log('Importing uren-afwezigheden, total rows:', jsonData.length);
      console.log('Available werknemers:', werknemers.length);
      
      // Check if this is the Werknemersafwezigheidsplanning format (monthly grid)
      // Look in rawData for "Naam van werknemer" pattern AND day numbers (1-31)
      let isMonthlyGridFormat = false;
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const row = rawData[i];
        if (Array.isArray(row)) {
          let hasNaamWerknemer = false;
          let hasDayNumbers = false;
          for (let cell of row) {
            const cellStr = cell ? cell.toString().toLowerCase() : '';
            if (cellStr.includes('naam') && cellStr.includes('werknemer')) {
              hasNaamWerknemer = true;
            }
            // Check for day numbers (1-31)
            if (cellStr && !isNaN(cellStr) && parseInt(cellStr) >= 1 && parseInt(cellStr) <= 31) {
              hasDayNumbers = true;
            }
          }
          if (hasNaamWerknemer && hasDayNumbers) {
            isMonthlyGridFormat = true;
            console.log('✓ Detected monthly grid format at row', i);
            break;
          }
        }
      }
      
      if (isMonthlyGridFormat) {
        console.log('✓ Detected monthly grid format (Werknemersafwezigheidsplanning)');
        const result = await importMonthlyGridFormat(rawData, firstSheetName, importType, werknemers, databaseOps);
        if (result.success) {
          imported.uren += result.imported.uren || 0;
          // Return early if monthly grid format was used
          return {
            success: true,
            message: imported.uren > 0 ? 'Import successful' : 'Import completed but no items imported',
            imported,
            debug: result.debug || {
              totalRows: rawData.length,
              availableColumns: ['Monthly grid format detected'],
              firstRowSample: rawData.length > 0 ? rawData[0] : null,
              importedCounts: result.imported || imported,
              warning: imported.uren === 0 ? 'No items were imported. Check console logs for details.' : null
            }
          };
        } else {
          return result; // Return error from monthly grid import
        }
      } else {
        // Original format: Werknemer/Naam, Datum, Uren, Type
        if (jsonData.length > 0) {
          console.log('Using standard format, first row sample:', JSON.stringify(jsonData[0]));
        }
        
        for (const row of jsonData) {
        const werknemerNaam = (findColumnValue(row, ['Werknemer', 'werknemer', 'Naam', 'naam', 'Name', 'name', 
                                                      'Employee', 'employee']) || '').toString().trim();
        const datum = findColumnValue(row, ['Datum', 'datum', 'DATUM', 'Date', 'date', 'DATE']) || '';
        const urenValue = findColumnValue(row, ['Uren', 'uren', 'UREN', 'Hours', 'hours', 'HOURS', 'Uur', 'uur']) || 0;
        const uren = parseFloat(urenValue) || 0;
        const type = (findColumnValue(row, ['Type', 'type', 'TYPE', 'Afwezigheid', 'afwezigheid', 'Soort', 'soort']) || '').toString().trim().toUpperCase();
        
        if (!werknemerNaam || !datum) {
          console.log('Skipping row - missing werknemer or datum:', { werknemerNaam, datum, row });
          continue;
        }
        
        // Map type to valid values: V=Vakantie, A=Aangepast, S=School
        let afwezigheidType = null;
        if (type === 'V' || type === 'VAKANTIE' || type === 'VACATION') {
          afwezigheidType = 'V';
        } else if (type === 'A' || type === 'AANGEPAST' || type === 'ADJUSTED') {
          afwezigheidType = 'A';
        } else if (type === 'S' || type === 'SCHOOL') {
          afwezigheidType = 'S';
        }
        
        // Must have either uren > 0 OR afwezigheidType
        if (uren <= 0 && !afwezigheidType) {
          console.log('Skipping row - no uren or afwezigheid:', { werknemerNaam, datum, uren, type, row });
          continue;
        }
        
        const werknemer = werknemers.find(w => w.naam.toLowerCase() === werknemerNaam.toLowerCase());
        if (!werknemer) {
          console.log('Werknemer not found:', werknemerNaam, 'Available:', werknemers.map(w => w.naam));
          continue;
        }
        
        try {
          // Parse date
          let dateObj;
          if (datum instanceof Date) {
            dateObj = datum;
          } else if (typeof datum === 'number') {
            dateObj = new Date((datum - 25569) * 86400 * 1000);
          } else if (typeof datum === 'string') {
            dateObj = new Date(datum);
            if (isNaN(dateObj.getTime()) && datum.match(/^\d+(\.\d+)?$/)) {
              const excelDate = parseFloat(datum);
              dateObj = new Date((excelDate - 25569) * 86400 * 1000);
            }
          } else {
            dateObj = new Date(datum);
          }
          
          if (!dateObj || isNaN(dateObj.getTime())) {
            console.log('Invalid date:', datum);
            continue;
          }
          
          const opmerking = findColumnValue(row, ['Opmerking', 'opmerking', 'Comment', 'comment', 
                                                   'Notitie', 'notitie', 'Note', 'note']) || '';
          
          // Create uren record (with optional afwezigheid type)
          databaseOps.createUren({
            werknemerId: werknemer.id,
            datum: dateObj.toISOString(),
            uren: uren,
            afwezigheid: afwezigheidType || null,
            opmerking: opmerking.toString().trim() || null
          });
          imported.uren++;
          console.log('Imported:', werknemerNaam, uren > 0 ? `${uren} uren` : `afwezigheid ${afwezigheidType}`, dateObj.toISOString());
        } catch (err) {
          console.error('Error importing uren-afwezigheden:', err, row);
        }
      }
      }
    } else {
      console.log('Unknown import type:', importType);
      return { 
        success: false, 
        error: `Unknown import type: ${importType}` 
      };
    }
    
    // Log summary
    console.log('=== IMPORT SUMMARY ===');
    console.log('Type:', importType);
    console.log('Total rows processed:', jsonData.length);
    console.log('Imported:', imported);
    console.log('=====================');
    
    return { 
      success: true, 
      message: 'Import successful',
      imported,
      debug: {
        totalRows: jsonData.length,
        availableColumns: jsonData.length > 0 ? Object.keys(jsonData[0]) : [],
        firstRowSample: jsonData.length > 0 ? jsonData[0] : null
      }
    };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: error.message };
  }
});

// Helper function to import monthly grid format (Werknemersafwezigheidsplanning)
async function importMonthlyGridFormat(rawData, sheetName, importType, werknemers, databaseOps) {
  const imported = { werknemers: 0, uren: 0 };
  
  // Find header row (row with "Naam van werknemer")
  let headerRowIndex = -1;
  let nameColumnIndex = -1;
  let dayColumns = []; // Array of {index, dayNumber}
  
  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const row = rawData[i];
    if (Array.isArray(row)) {
      // Look for "Naam van werknemer" or similar
      for (let j = 0; j < row.length; j++) {
        const cell = row[j] ? row[j].toString().toLowerCase() : '';
        if (cell.includes('naam') && (cell.includes('werknemer') || cell.includes('medewerker'))) {
          headerRowIndex = i;
          nameColumnIndex = j;
          // Find day columns (numbers 1-31)
          dayColumns = [];
          for (let k = j + 1; k < row.length; k++) {
            const dayCell = row[k] ? row[k].toString().trim() : '';
            // Check if it's a day number (1-31) or empty (skip totals)
            if (dayCell && !isNaN(dayCell) && parseInt(dayCell) >= 1 && parseInt(dayCell) <= 31) {
              dayColumns.push({ index: k, dayNumber: parseInt(dayCell) });
            } else if (dayCell.toLowerCase().includes('totaal')) {
              break; // Stop at totals column
            }
          }
          console.log('Found header row at index', i, 'Name column:', nameColumnIndex, 'Day columns:', dayColumns.length);
          break;
        }
      }
      if (headerRowIndex >= 0) break;
    }
  }
  
  if (headerRowIndex === -1 || nameColumnIndex === -1) {
    console.log('❌ Could not find header row with "Naam van werknemer"');
    console.log('Searched first 10 rows. Showing each row:');
    let rowDetails = [];
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      if (Array.isArray(row)) {
        const rowStr = row.slice(0, 10).map(c => c ? c.toString().substring(0, 30) : '').join(' | ');
        console.log(`Row ${i}:`, rowStr);
        rowDetails.push(`Row ${i}: ${rowStr}`);
      }
    }
    return { 
      success: false, 
      error: 'Could not find header row with "Naam van werknemer" in Excel file', 
      imported,
      debug: {
        totalRows: rawData.length,
        searchedRows: 10,
        rowDetails: rowDetails
      }
    };
  }
  
  console.log('✓ Header row found:', headerRowIndex, 'Name column:', nameColumnIndex, 'Days:', dayColumns.length);
  
  // Get month and year from sheet name (passed as parameter)
  const monthNames = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 
                      'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  let month = -1;
  for (let i = 0; i < monthNames.length; i++) {
    if (sheetName.toLowerCase().includes(monthNames[i])) {
      month = i + 1;
      break;
    }
  }
  
  // Try to find year in row 3 (usually has year)
  let year = new Date().getFullYear();
  if (rawData.length > 3 && Array.isArray(rawData[3])) {
    for (let cell of rawData[3]) {
      if (cell && typeof cell === 'number' && cell >= 2020 && cell <= 2100) {
        year = cell;
        break;
      }
    }
  }
  
  console.log('Importing for month:', month, 'year:', year, 'sheetName:', sheetName);
  
  if (month === -1) {
    console.log('❌ Could not determine month from sheet name:', sheetName);
    // Try to find month name in rawData (row 3 usually has month name)
    for (let i = 0; i < Math.min(5, rawData.length); i++) {
      const row = rawData[i];
      if (Array.isArray(row)) {
        for (let cell of row) {
          const cellStr = cell ? cell.toString().toLowerCase() : '';
          for (let j = 0; j < monthNames.length; j++) {
            if (cellStr.includes(monthNames[j])) {
              month = j + 1;
              console.log('✓ Found month in data row', i, ':', monthNames[j], '=', month);
              break;
            }
          }
          if (month !== -1) break;
        }
        if (month !== -1) break;
      }
    }
    
    if (month === -1) {
      return { success: false, error: 'Could not determine month from sheet name or data', imported };
    }
  }
  
  console.log('Processing data rows from', headerRowIndex + 1, 'to', rawData.length);
  console.log('Available werknemers:', werknemers.map(w => w.naam));
  
  // Process data rows (start after header row)
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!Array.isArray(row)) continue;
    
    const werknemerNaam = row[nameColumnIndex] ? row[nameColumnIndex].toString().trim() : '';
    if (!werknemerNaam || werknemerNaam.toLowerCase().includes('totaal')) {
      continue; // Skip empty rows and totals
    }
    
    console.log('Processing werknemer:', werknemerNaam, 'row', i);
    
    // Find werknemer
    const werknemer = werknemers.find(w => w.naam.toLowerCase() === werknemerNaam.toLowerCase());
    if (!werknemer) {
      console.log('❌ Werknemer not found:', werknemerNaam, 'Available:', werknemers.map(w => w.naam));
      continue;
    }
    
    console.log('✓ Werknemer found:', werknemer.id, werknemer.naam);
    
    // Process each day column
    let importedForThisWerknemer = 0;
    for (const dayCol of dayColumns) {
      const cellValue = row[dayCol.index];
      if (!cellValue && cellValue !== 0 && cellValue !== '') continue; // Skip empty cells
      
      const day = dayCol.dayNumber;
      const dateObj = new Date(year, month - 1, day);
      
      // Skip invalid dates (e.g., Feb 30)
      if (dateObj.getDate() !== day || dateObj.getMonth() !== month - 1) {
        continue;
      }
      
      try {
        const cellStr = cellValue.toString().trim();
        let uren = 0;
        let afwezigheidType = null;
        
        // Check if it's a number (uren)
        if (!isNaN(cellStr) && cellStr !== '') {
          uren = parseFloat(cellStr);
        } 
        // Check if it's an afwezigheid type (V, A, P, Z, S)
        else if (cellStr.length === 1) {
          const upper = cellStr.toUpperCase();
          if (upper === 'V') afwezigheidType = 'V';
          else if (upper === 'A') afwezigheidType = 'A';
          else if (upper === 'P') afwezigheidType = 'A'; // Persoonlijk = Aangepast
          else if (upper === 'Z') afwezigheidType = 'A'; // Ziek = Aangepast (or could be separate)
          else if (upper === 'S') afwezigheidType = 'S';
        }
        
        // Only create record if there's data
        if (uren > 0 || afwezigheidType) {
          // Check if record already exists for this date
          const existing = databaseOps.getUren().find(u => 
            u.werknemerId === werknemer.id && 
            u.datum.startsWith(dateObj.toISOString().split('T')[0])
          );
          
          if (!existing) {
            databaseOps.createUren({
              werknemerId: werknemer.id,
              datum: dateObj.toISOString(),
              uren: uren,
              afwezigheid: afwezigheidType,
              opmerking: null
            });
            imported.uren++;
            importedForThisWerknemer++;
            console.log('  ✓ Imported:', dateObj.toISOString().split('T')[0], 
                       uren > 0 ? `${uren} uren` : `afwezigheid ${afwezigheidType}`);
          } else {
            console.log('  ⊗ Skipped (exists):', dateObj.toISOString().split('T')[0]);
          }
        }
      } catch (err) {
        console.error('  ❌ Error processing cell:', err, {werknemerNaam, day, cellValue});
      }
    }
    if (importedForThisWerknemer > 0) {
      console.log('Total imported for', werknemerNaam, ':', importedForThisWerknemer);
    }
  }
  
  console.log('=== MONTHLY GRID IMPORT COMPLETED ===');
  console.log('Total imported:', imported);
  console.log('=====================================');
  
  if (imported.uren === 0) {
    console.log('⚠️ WARNING: No items were imported!');
    console.log('Possible reasons:');
    console.log('- No matching werknemers found in database');
    console.log('- All records already exist');
    console.log('- No valid data in cells');
  }
  
  return { 
    success: true, 
    message: 'Import successful',
    imported,
    debug: {
      totalRows: rawData.length,
      headerRowIndex: headerRowIndex,
      nameColumnIndex: nameColumnIndex,
      dayColumnsCount: dayColumns.length,
      month: month,
      year: year,
      importedCounts: imported
    }
  };
}

ipcMain.handle('analyze:excel', async (event, base64, fileName) => {
  try {
    const buffer = Buffer.from(base64, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    // Analyze workbook and return structure
    return { success: true, sheets: workbook.SheetNames };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('import:dagontvangsten', async (event, base64, fileName) => {
  try {
    const buffer = Buffer.from(base64, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
    
    let imported = { records: 0 };
    
    for (const row of jsonData) {
      // Expected columns: Datum, BTW 6%, BTW 12%, BTW 21%, Opmerking (optional)
      const datum = row['Datum'] || row['datum'] || row['DATE'] || row['date'] || '';
      const btw6 = parseFloat(row['BTW 6%'] || row['btw 6%'] || row['6%'] || row['6'] || 0) || 0;
      const btw12 = parseFloat(row['BTW 12%'] || row['btw 12%'] || row['12%'] || row['12'] || 0) || 0;
      const btw21 = parseFloat(row['BTW 21%'] || row['btw 21%'] || row['21%'] || row['21'] || 0) || 0;
      const opmerking = row['Opmerking'] || row['opmerking'] || row['Comment'] || row['comment'] || null;
      
      if (!datum) continue;
      
      let dateObj;
      if (datum instanceof Date) {
        dateObj = datum;
      } else if (typeof datum === 'number') {
        dateObj = new Date((datum - 25569) * 86400 * 1000);
      } else if (typeof datum === 'string') {
        dateObj = new Date(datum);
        if (isNaN(dateObj.getTime()) && datum.match(/^\d+(\.\d+)?$/)) {
          const excelDate = parseFloat(datum);
          dateObj = new Date((excelDate - 25569) * 86400 * 1000);
        }
      } else {
        dateObj = new Date(datum);
      }
      
      if (!dateObj || isNaN(dateObj.getTime())) continue;
      
      const totaal = btw6 + btw12 + btw21;
      
      if (totaal > 0) {
        databaseOps.createDagontvangst({
          datum: dateObj.toISOString(),
          totaal: totaal,
          btw6: btw6,
          btw12: btw12,
          btw21: btw21,
          opmerking: opmerking
        });
        imported.records++;
      }
    }
    
    return { 
      success: true, 
      message: 'Dagontvangsten import successful',
      imported 
    };
  } catch (error) {
    console.error('Dagontvangsten import error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('import:gratiscola', async (event, base64, fileName) => {
  try {
    const buffer = Buffer.from(base64, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
    
    let imported = { records: 0 };
    
    for (const row of jsonData) {
      // Expected columns: Datum, Gratis, Verkocht
      const datum = row['Datum'] || row['datum'] || row['DATE'] || row['date'] || '';
      const gratis = parseFloat(row['Gratis'] || row['gratis'] || row['GRATIS'] || 0) || 0;
      const verkocht = parseFloat(row['Verkocht'] || row['verkocht'] || row['VERKOCHT'] || 0) || 0;
      
      if (!datum) continue;
      
      let dateObj;
      if (datum instanceof Date) {
        dateObj = datum;
      } else if (typeof datum === 'number') {
        dateObj = new Date((datum - 25569) * 86400 * 1000);
      } else if (typeof datum === 'string') {
        dateObj = new Date(datum);
        if (isNaN(dateObj.getTime()) && datum.match(/^\d+(\.\d+)?$/)) {
          const excelDate = parseFloat(datum);
          dateObj = new Date((excelDate - 25569) * 86400 * 1000);
        }
      } else {
        dateObj = new Date(datum);
      }
      
      if (!dateObj || isNaN(dateObj.getTime())) continue;
      
      if (gratis > 0 || verkocht > 0) {
        databaseOps.createGratisCola({
          datum: dateObj.toISOString(),
          gratis: gratis,
          verkocht: verkocht
        });
        imported.records++;
      }
    }
    
    return { 
      success: true, 
      message: 'Gratis cola import successful',
      imported 
    };
  } catch (error) {
    console.error('Gratis cola import error:', error);
    return { success: false, error: error.message };
  }
});
