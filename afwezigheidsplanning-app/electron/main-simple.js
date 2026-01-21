const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
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
    icon: path.join(__dirname, '../build/icon.ico'),
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
  
  // Allow F12 to toggle DevTools (always available)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
    }
  });
  
  // Log console messages from main process to renderer
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[Main Process] ${message}`);
  });
  
  let isClosing = false;
  let closeTimeout = null;
  
  // Handle window close - give time to save data
  mainWindow.on('close', (event) => {
    if (!isClosing) {
      event.preventDefault();
      isClosing = true;
      
      console.log('Window close requested - waiting for data save...');
      
      // Clear any existing timeout
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      
      // Send message to renderer to save data before closing
      mainWindow.webContents.send('window-close');
      
      // Set timeout as fallback (max 3 seconds wait for save to complete)
      closeTimeout = setTimeout(() => {
        console.log('Save timeout reached - closing window');
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.destroy();
        }
        isClosing = false;
        closeTimeout = null;
      }, 3000);
      
      // Register save-complete handler for this close event
      // Use once to ensure it only fires once per close event
      ipcMain.once('save-complete', async () => {
        console.log('Save complete signal received - forcing database save and closing window');
        
        // Clear any pending timeout
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
        
        // Force immediate database save - CRITICAL: ensure data is written to disk
        try {
          const { forceSaveDatabase } = require('./database-simple');
          forceSaveDatabase(); // Force synchronous save
          console.log('Database force save completed - data should be on disk');
        } catch (error) {
          console.error('Error forcing database save:', error);
        }
        
        // Additional delay to ensure file system has committed the write
        setTimeout(() => {
          console.log('Closing window after save confirmation');
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.destroy();
          }
          isClosing = false;
        }, 500); // Increased delay to ensure file write completes and is committed to disk
      });
    }
  });
  
  return mainWindow;
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
    case 'dagontvangsten': return databaseOps.updateDagontvangst(id, updates);
    case 'gratisCola': return databaseOps.updateGratisCola(id, updates);
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
    case 'dagontvangsten': databaseOps.deleteDagontvangst(id); break;
    case 'gratisCola': databaseOps.deleteGratisCola(id); break;
  }
  return { success: true };
});

// Force save database handler - explicitly save database to disk
ipcMain.handle('db:force-save', async (event) => {
  try {
    const { forceSaveDatabase } = require('./database-simple');
    forceSaveDatabase();
    return { success: true };
  } catch (error) {
    console.error('Error in force save:', error);
    return { success: false, error: error.message };
  }
});

// Backup handlers
ipcMain.handle('backup:create', async (event, reason = 'manual') => {
  try {
    const { createBackup } = require('./database-simple');
    const backupPath = createBackup(reason);
    return { success: true, backupPath };
  } catch (error) {
    console.error('Error creating backup:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('backup:list', async (event) => {
  try {
    const { getBackupList } = require('./database-simple');
    const backups = getBackupList();
    return { success: true, backups };
  } catch (error) {
    console.error('Error getting backup list:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('backup:restore', async (event, backupFilePath) => {
  try {
    const { restoreFromBackup } = require('./database-simple');
    restoreFromBackup(backupFilePath);
    return { success: true };
  } catch (error) {
    console.error('Error restoring backup:', error);
    return { success: false, error: error.message };
  }
});

// Excel import handlers
ipcMain.handle('import:excel', async (event, base64, fileName, importType) => {
  try {
    // Create backup before import
    const { createBackup } = require('./database-simple');
    createBackup(`before-import-${importType}`);
    
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
      uren: 0,
      records: 0  // For dagontvangsten and gratis-cola
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
      // Check if this is the monthly grid format (Kilometer2026.xlsx format)
      // These files have row 5 (index 5) with headers: "Naam werknemer", "Begin Km maand", etc, and day numbers 1-31
      const werknemers = databaseOps.getWerknemers();
      let isMonthlyGridFormat = false;
      
      // Check row 5 (index 5) specifically - this is where headers are in Kilometer files
      if (rawData.length > 5 && Array.isArray(rawData[5])) {
        const row5 = rawData[5];
        let hasNaamWerknemer = false;
        let dayCount = 0;
        
        for (let j = 0; j < row5.length; j++) {
          const cell = row5[j];
          if (!cell || cell === '') continue;
          
          const cellStr = cell.toString().toLowerCase().trim();
          
          // Check for "Naam werknemer" - this is the key indicator
          if (cellStr.includes('naam') && cellStr.includes('werknemer')) {
            hasNaamWerknemer = true;
          }
          
          // Check for day numbers (1-31)
          const cellNum = parseInt(cellStr);
          if (!isNaN(cellNum) && cellNum >= 1 && cellNum <= 31 && cellStr === String(cellNum)) {
            dayCount++;
          }
        }
        
        // If we have "Naam werknemer" and at least 10 day numbers, it's definitely a monthly grid
        if (hasNaamWerknemer && dayCount >= 10) {
          isMonthlyGridFormat = true;
          console.log(`✓ Detected monthly grid format for kilometers at row 5 (found ${dayCount} day columns)`);
        }
      }
      
      // If not found in row 5, check other rows (4-7) as fallback
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
            console.log(`✓ Detected monthly grid format for kilometers at row ${i} (found ${dayCount} day columns)`);
            break;
          }
        }
      }
      
      if (isMonthlyGridFormat) {
        console.log('✓ Detected monthly grid format (Kilometer maandoverzicht)');
        const result = await importMonthlyGridFormatKm(rawData, firstSheetName, werknemers, databaseOps);
        if (result.success) {
          imported.kilometers += result.imported.kilometers || 0;
          return {
            success: true,
            message: imported.kilometers > 0 ? 'Import successful' : 'Import completed but no items imported',
            imported,
            debug: result.debug || {
              totalRows: rawData.length,
              availableColumns: ['Monthly grid format detected'],
              firstRowSample: rawData.length > 0 ? rawData[0] : null
            }
          };
        } else {
          return result; // Return error from monthly grid import
        }
      }
      
      // Standard format: Expected columns: Werknemer/Naam, Datum, Kilometers, Van (optional), Naar (optional), Doel (optional)
      console.log('Importing kilometers (standard format), total rows:', jsonData.length);
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
        let werknemer = werknemers.find(w => w.naam.toLowerCase() === werknemerNaam.toLowerCase());
        if (!werknemer) {
          console.log('⚠️ Werknemer not found:', werknemerNaam, '- Creating automatically...');
          // Auto-create werknemer
          try {
            werknemer = databaseOps.createWerknemer({
              naam: werknemerNaam,
              email: null,
              nummerplaat: null
            });
            imported.werknemers++;
            werknemers.push(werknemer); // Add to local array for subsequent lookups
            console.log('✓ Created new werknemer:', werknemer.id, werknemer.naam);
          } catch (err) {
            console.error('Error creating werknemer:', err);
            continue;
          }
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
        let werknemer = werknemers.find(w => w.naam.toLowerCase() === werknemerNaam.toLowerCase());
        if (!werknemer) {
          console.log('⚠️ Werknemer not found:', werknemerNaam, '- Creating automatically...');
          // Auto-create werknemer
          try {
            werknemer = databaseOps.createWerknemer({
              naam: werknemerNaam,
              email: null,
              nummerplaat: null
            });
            imported.werknemers++;
            werknemers.push(werknemer); // Add to local array for subsequent lookups
            console.log('✓ Created new werknemer:', werknemer.id, werknemer.naam);
          } catch (err) {
            console.error('Error creating werknemer:', err);
            continue;
          }
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
      // Usually header is at row 5 (index 5), but check rows 0-10
      let isMonthlyGridFormat = false;
      let detectionRow = -1;
      for (let i = 0; i < Math.min(15, rawData.length); i++) {
        const row = rawData[i];
        if (Array.isArray(row)) {
          let hasNaamWerknemer = false;
          let dayCount = 0;
          for (let cell of row) {
            const cellStr = cell ? cell.toString().toLowerCase().trim() : '';
            // Check for "naam" and "werknemer" in same cell or nearby
            if (cellStr.includes('naam') && (cellStr.includes('werknemer') || cellStr.includes('medewerker'))) {
              hasNaamWerknemer = true;
            }
            // Check for day numbers (1-31) - can be string or number
            const cellNum = typeof cell === 'number' ? cell : (cellStr && !isNaN(cellStr) ? parseInt(cellStr) : NaN);
            if (!isNaN(cellNum) && cellNum >= 1 && cellNum <= 31) {
              dayCount++;
            }
          }
          // Need both naam/werknemer AND at least 5 day numbers to be sure
          if (hasNaamWerknemer && dayCount >= 5) {
            isMonthlyGridFormat = true;
            detectionRow = i;
            console.log('✓ Detected monthly grid format at row', i, `(found ${dayCount} day columns)`);
            break;
          }
        }
      }
      
      // Additional check: if we have many rows but jsonData is empty or has weird structure, 
      // it's likely a monthly grid format
      if (!isMonthlyGridFormat && rawData.length > 10 && (jsonData.length === 0 || jsonData.length < 3)) {
        console.log('⚠️ Suspicious: Many raw rows but few jsonData rows - might be monthly grid format');
        // Check if any row has day numbers 1-31
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
          const row = rawData[i];
          if (Array.isArray(row)) {
            let dayCount = 0;
            for (let cell of row) {
              const cellNum = typeof cell === 'number' ? cell : (cell ? parseInt(cell.toString()) : NaN);
              if (!isNaN(cellNum) && cellNum >= 1 && cellNum <= 31) {
                dayCount++;
              }
            }
            if (dayCount >= 10) {
              console.log('✓ Found many day numbers in row', i, '- treating as monthly grid format');
              isMonthlyGridFormat = true;
              detectionRow = i;
              break;
            }
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
            imported: {
              werknemers: imported.werknemers,
              kilometers: imported.kilometers,
              uren: imported.uren,
              records: imported.records
            },
            debug: {
              totalRows: rawData.length,
              availableColumns: result.debug?.availableColumns || ['Monthly grid format detected'],
              firstRowSample: result.debug?.firstRowSample || (rawData.length > 0 ? rawData[0] : null),
              importedCounts: result.imported || imported,
              warning: imported.uren === 0 ? 'No items were imported. Check console logs for details.' : null,
              detectionRow: detectionRow
            }
          };
        } else {
          // Return error but include debug info
          return {
            ...result,
            debug: {
              ...result.debug,
              totalRows: rawData.length,
              availableColumns: result.debug?.availableColumns || ['Monthly grid format detected but import failed'],
              firstRowSample: result.debug?.firstRowSample || (rawData.length > 0 ? rawData[0] : null)
            }
          };
        }
      } else {
        console.log('⚠️ Monthly grid format NOT detected, will try standard format (which may not work for this file)');
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
          
          let werknemer = werknemers.find(w => w.naam.toLowerCase() === werknemerNaam.toLowerCase());
          if (!werknemer) {
            console.log('⚠️ Werknemer not found:', werknemerNaam, '- Creating automatically...');
            // Auto-create werknemer
            try {
              werknemer = databaseOps.createWerknemer({
                naam: werknemerNaam,
                email: null,
                nummerplaat: null
              });
              imported.werknemers++;
              werknemers.push(werknemer); // Add to local array for subsequent lookups
              console.log('✓ Created new werknemer:', werknemer.id, werknemer.naam);
            } catch (err) {
              console.error('Error creating werknemer:', err);
              continue;
            }
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
    } else if (importType === 'dagontvangsten') {
      // Dagontvangsten import - use the existing handler
      // For now, redirect to the separate handler logic
      // Expected columns: Datum, BTW 6%, BTW 12%, BTW 21%, Opmerking (optional)
      console.log('Importing dagontvangsten, total rows:', jsonData.length);
      if (jsonData.length > 0) {
        console.log('First row sample:', JSON.stringify(jsonData[0]));
      }
      
      for (const row of jsonData) {
        const datum = findColumnValue(row, ['Datum', 'datum', 'DATUM', 'Date', 'date', 'DATE']) || '';
        // Try multiple column name variations, including just "6", "12", "21"
        let btw6 = 0;
        let btw12 = 0;
        let btw21 = 0;
        
        // Try named columns first
        const btw6Value = findColumnValue(row, ['BTW 6%', 'btw 6%', '6%', 'BTW 6', 'btw 6']);
        if (btw6Value !== undefined && btw6Value !== null && btw6Value !== '') {
          btw6 = parseFloat(btw6Value) || 0;
        } else if (row['6'] !== undefined) {
          btw6 = parseFloat(row['6']) || 0;
        }
        
        const btw12Value = findColumnValue(row, ['BTW 12%', 'btw 12%', '12%', 'BTW 12', 'btw 12']);
        if (btw12Value !== undefined && btw12Value !== null && btw12Value !== '') {
          btw12 = parseFloat(btw12Value) || 0;
        } else if (row['12'] !== undefined) {
          btw12 = parseFloat(row['12']) || 0;
        }
        
        const btw21Value = findColumnValue(row, ['BTW 21%', 'btw 21%', '21%', 'BTW 21', 'btw 21']);
        if (btw21Value !== undefined && btw21Value !== null && btw21Value !== '') {
          btw21 = parseFloat(btw21Value) || 0;
        } else if (row['21'] !== undefined) {
          btw21 = parseFloat(row['21']) || 0;
        }
        
        const opmerking = findColumnValue(row, ['Opmerking', 'opmerking', 'Comment', 'comment']) || null;
        
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
          try {
            // Check if record already exists for this date
            const allOntvangsten = databaseOps.getDagontvangsten();
            const dateStr = dateObj.toISOString().split('T')[0];
            const existing = allOntvangsten.find(o => {
              try {
                const storedDate = new Date(o.datum);
                const storedDateStr = storedDate.toISOString().split('T')[0];
                return storedDateStr === dateStr;
              } catch (e) {
                return false;
              }
            });
            
            if (existing) {
              // Update existing record instead of creating duplicate
              const categorieen = {
                '6': btw6,
                '12': btw12,
                '21': btw21
              };
              databaseOps.updateDagontvangst(existing.id, {
                datum: dateObj.toISOString(),
                totaal: totaal,
                categorieen: categorieen,
                opmerking: opmerking
              });
              imported.records++;
              console.log('Updated existing dagontvangst:', dateStr, totaal);
            } else {
              // Create new record
              databaseOps.createDagontvangst({
                datum: dateObj.toISOString(),
                totaal: totaal,
                btw6: btw6,
                btw12: btw12,
                btw21: btw21,
                opmerking: opmerking
              });
              imported.records++;
              console.log('Imported new dagontvangst:', dateStr, totaal);
            }
          } catch (err) {
            console.error('Error importing dagontvangst:', err, row);
          }
        }
      }
    } else if (importType === 'gratis-cola') {
      // Gratis Cola import
      // Can have two formats:
      // 1. Standard: Datum, Gratis, Verkocht columns
      // 2. Grid format: Columns are Excel serial dates (45658, 45689, etc.)
      console.log('Importing gratis-cola, total rows:', jsonData.length);
      if (jsonData.length > 0) {
        console.log('First row sample:', JSON.stringify(jsonData[0]));
        console.log('Available columns:', Object.keys(jsonData[0]));
      }
      
      // Check if columns are Excel serial dates (grid format)
      const firstRow = jsonData.length > 0 ? jsonData[0] : {};
      const columnNames = Object.keys(firstRow);
      const hasDateColumns = columnNames.some(col => {
        const num = parseFloat(col);
        return !isNaN(num) && num >= 40000 && num <= 50000; // Excel dates in this range
      });
      
      if (hasDateColumns) {
        console.log('✓ Detected grid format with date columns');
        // Grid format: Structure appears to be groups of 4 columns per date
        // Pattern: [datum, value1, value2, value3, datum, value1, value2, value3, ...]
        // Or: Each row represents a day, first column is date, then values
        
        // Try to process from rawData - look for date values in first column of each row
        for (let i = 0; i < rawData.length; i++) {
          const row = rawData[i];
          if (!Array.isArray(row) || row.length < 2) continue;
          
          // Check if first column is an Excel serial date
          const firstCell = row[0];
          let excelDateNum = null;
          
          if (typeof firstCell === 'number' && firstCell >= 40000 && firstCell <= 50000) {
            excelDateNum = firstCell;
          } else if (firstCell && typeof firstCell === 'string') {
            const parsed = parseFloat(firstCell);
            if (!isNaN(parsed) && parsed >= 40000 && parsed <= 50000) {
              excelDateNum = parsed;
            }
          }
          
          if (excelDateNum) {
            const dateObj = new Date((excelDateNum - 25569) * 86400 * 1000);
            if (isNaN(dateObj.getTime())) continue;
            
            // Look for gratis and verkocht values in this row
            // Usually they are in columns after the date
            // Pattern might be: [date, gratis, verkocht, ...] or [date, value1, value2, ...]
            let gratis = 0;
            let verkocht = 0;
            
            // Try to find values in columns 1, 2, 3, etc.
            // Usually gratis is first value, verkocht is second (or we need to detect)
            for (let j = 1; j < Math.min(row.length, 10); j++) {
              const cellValue = row[j];
              if (cellValue === null || cellValue === undefined || cellValue === '') continue;
              
              const numValue = typeof cellValue === 'number' ? cellValue : parseFloat(cellValue);
              if (!isNaN(numValue) && numValue > 0) {
                // First non-zero value after date is likely gratis, second is verkocht
                if (gratis === 0) {
                  gratis = numValue;
                } else if (verkocht === 0) {
                  verkocht = numValue;
                  break; // Found both
                }
              }
            }
            
            // Also check if there are multiple date groups in the row
            // Look for other dates in the row and process them
            for (let j = 1; j < row.length; j++) {
              const cell = row[j];
              let cellDateNum = null;
              
              if (typeof cell === 'number' && cell >= 40000 && cell <= 50000) {
                cellDateNum = cell;
              } else if (cell && typeof cell === 'string') {
                const parsed = parseFloat(cell);
                if (!isNaN(parsed) && parsed >= 40000 && parsed <= 50000) {
                  cellDateNum = parsed;
                }
              }
              
              if (cellDateNum) {
                const cellDateObj = new Date((cellDateNum - 25569) * 86400 * 1000);
                if (!isNaN(cellDateObj.getTime())) {
                  // Get values after this date
                  let cellGratis = 0;
                  let cellVerkocht = 0;
                  
                  for (let k = j + 1; k < Math.min(row.length, j + 4); k++) {
                    const val = row[k];
                    if (val === null || val === undefined || val === '') continue;
                    const numVal = typeof val === 'number' ? val : parseFloat(val);
                    if (!isNaN(numVal) && numVal > 0) {
                      if (cellGratis === 0) {
                        cellGratis = numVal;
                      } else if (cellVerkocht === 0) {
                        cellVerkocht = numVal;
                        break;
                      }
                    }
                  }
                  
                  if (cellGratis > 0 || cellVerkocht > 0) {
                    try {
                      databaseOps.createGratisCola({
                        datum: cellDateObj.toISOString(),
                        gratis: cellGratis,
                        verkocht: cellVerkocht
                      });
                      imported.records++;
                      console.log('Imported gratis cola:', cellDateObj.toISOString().split('T')[0], cellGratis, cellVerkocht);
                    } catch (err) {
                      console.error('Error importing gratis cola:', err);
                    }
                  }
                }
              }
            }
            
            // Process the first date in the row
            if (gratis > 0 || verkocht > 0) {
              try {
                databaseOps.createGratisCola({
                  datum: dateObj.toISOString(),
                  gratis: gratis,
                  verkocht: verkocht
                });
                imported.records++;
                console.log('Imported gratis cola:', dateObj.toISOString().split('T')[0], gratis, verkocht);
              } catch (err) {
                console.error('Error importing gratis cola:', err);
              }
            }
          }
        }
      } else {
        // Standard format: Datum, Gratis, Verkocht columns
        for (const row of jsonData) {
          const datum = findColumnValue(row, ['Datum', 'datum', 'DATUM', 'Date', 'date', 'DATE']) || '';
          const gratis = parseFloat(findColumnValue(row, ['Gratis', 'gratis', 'GRATIS']) || 0) || 0;
          const verkocht = parseFloat(findColumnValue(row, ['Verkocht', 'verkocht', 'VERKOCHT']) || 0) || 0;
          
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
            try {
              databaseOps.createGratisCola({
                datum: dateObj.toISOString(),
                gratis: gratis,
                verkocht: verkocht
              });
              imported.records++;
              console.log('Imported gratis cola:', dateObj.toISOString().split('T')[0], gratis, verkocht);
            } catch (err) {
              console.error('Error importing gratis cola:', err, row);
            }
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
    let werknemer = werknemers.find(w => w.naam.toLowerCase() === werknemerNaam.toLowerCase());
    if (!werknemer) {
      console.log('⚠️ Werknemer not found:', werknemerNaam, '- Creating automatically...');
      // Auto-create werknemer
      try {
        werknemer = databaseOps.createWerknemer({
          naam: werknemerNaam,
          email: null,
          nummerplaat: null
        });
        imported.werknemers++;
        werknemers.push(werknemer); // Add to local array for subsequent lookups
        console.log('✓ Created new werknemer:', werknemer.id, werknemer.naam);
      } catch (err) {
        console.error('Error creating werknemer:', err);
        continue;
      }
    } else {
      console.log('✓ Werknemer found:', werknemer.id, werknemer.naam);
    }
    
    // Process each day column
    let importedForThisWerknemer = 0;
    for (const dayCol of dayColumns) {
      const cellValue = row[dayCol.index];
      
      // Skip empty cells (null, undefined, empty string, but NOT 0)
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        continue;
      }
      
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
        // Check if it's an afwezigheid type (V, A, P, Z, S, G)
        else if (cellStr.length === 1) {
          const upper = cellStr.toUpperCase();
          if (upper === 'V') afwezigheidType = 'V';
          else if (upper === 'A') afwezigheidType = 'A';
          else if (upper === 'P') afwezigheidType = 'A'; // Persoonlijk = Aangepast
          else if (upper === 'Z') afwezigheidType = 'A'; // Ziek = Aangepast (or could be separate)
          else if (upper === 'S') afwezigheidType = 'S';
          else if (upper === 'G') {
            // G = Gesloten (maandag), geen actie nodig, skip
            continue;
          }
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

// Helper function to import monthly grid format for kilometers (Kilometer2026.xlsx format)
async function importMonthlyGridFormatKm(rawData, sheetName, werknemers, databaseOps) {
  const imported = { kilometers: 0 };
  
  // Find header row (row with "Naam werknemer" or "Naam van werknemer")
  let headerRowIndex = -1;
  let nameColumnIndex = -1;
  let dayColumns = []; // Array of {index, dayNumber}
  
  // Look for header row - usually row 5 (index 5) for these Excel files
  for (let i = 0; i < Math.min(15, rawData.length); i++) {
    const row = rawData[i];
    if (!Array.isArray(row)) continue;
    
    let foundNaamColumn = -1;
    let dayCols = [];
    
    // Check all cells in this row
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (!cell || cell === '') continue;
      
      const cellStr = cell.toString().toLowerCase().trim();
      
      // Check for "Naam werknemer" or "Naam van werknemer" column
      if (cellStr.includes('naam')) {
        if (cellStr.includes('werknemer') || cellStr.includes('medewerker') || 
            cellStr.includes('van werknemer')) {
          foundNaamColumn = j;
          console.log(`Found "Naam" column at row ${i}, column ${j}: "${cell}"`);
        }
      }
    }
    
    // If we found a naam column, look for day numbers in the same row
    if (foundNaamColumn >= 0) {
      for (let k = foundNaamColumn + 1; k < row.length; k++) {
        const dayCell = row[k];
        if (!dayCell || dayCell === '') continue;
        
        const dayCellStr = dayCell.toString().trim();
        
        // Check if it's a day number (1-31) - must be exact integer match
        const dayNum = parseInt(dayCellStr);
        if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
          // Verify it's exactly the number (not "10km" or something)
          if (dayCellStr === String(dayNum) || dayCellStr === dayNum.toString()) {
            dayCols.push({ index: k, dayNumber: dayNum });
          }
        } else if (dayCellStr.toLowerCase().includes('totaal') || 
                   dayCellStr.toLowerCase().includes('te betalen') ||
                   dayCellStr.toLowerCase().includes('handtekening') ||
                   dayCellStr.toLowerCase().includes('kost')) {
          break; // Stop at totals/signature columns
        }
      }
      
      // If we found at least 10 day columns, this is definitely the header row
      if (dayCols.length >= 10) {
        headerRowIndex = i;
        nameColumnIndex = foundNaamColumn;
        dayColumns = dayCols;
        console.log(`✓ Found header row at index ${i}, Name column: ${nameColumnIndex}, Day columns: ${dayColumns.length}`);
        console.log(`  First few day columns: ${dayCols.slice(0, 5).map(d => `Col${d.index}=${d.dayNumber}`).join(', ')}`);
        break;
      } else if (dayCols.length >= 5) {
        // Minimum 5 day columns is also acceptable
        headerRowIndex = i;
        nameColumnIndex = foundNaamColumn;
        dayColumns = dayCols;
        console.log(`✓ Found header row at index ${i} (with ${dayCols.length} day columns)`);
        break;
      }
    }
  }
  
  if (headerRowIndex === -1 || nameColumnIndex === -1) {
    console.log('❌ Could not find header row with "Naam werknemer"');
    return { 
      success: false, 
      error: 'Could not find header row with "Naam werknemer" in Excel file', 
      imported
    };
  }
  
  console.log('✓ Header row found:', headerRowIndex, 'Name column:', nameColumnIndex, 'Days:', dayColumns.length);
  
  // Get month and year from sheet name
  const monthNames = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 
                      'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  let month = -1;
  for (let i = 0; i < monthNames.length; i++) {
    if (sheetName.toLowerCase().includes(monthNames[i])) {
      month = i + 1;
      break;
    }
  }
  
  // Try to find year in row 3 (usually has year) or anywhere in first few rows
  let year = new Date().getFullYear();
  for (let rowIdx = 0; rowIdx < Math.min(5, rawData.length); rowIdx++) {
    const row = rawData[rowIdx];
    if (Array.isArray(row)) {
      for (let cell of row) {
        if (cell) {
          // Check if it's a number
          if (typeof cell === 'number' && cell >= 2020 && cell <= 2100) {
            year = cell;
            console.log(`✓ Found year ${year} in row ${rowIdx}`);
            break;
          }
          // Check if it's a string that looks like a year
          const cellStr = cell.toString().trim();
          const yearNum = parseInt(cellStr);
          if (!isNaN(yearNum) && yearNum >= 2020 && yearNum <= 2100 && cellStr.length === 4) {
            year = yearNum;
            console.log(`✓ Found year ${year} in row ${rowIdx} (from string)`);
            break;
          }
        }
      }
      if (year !== new Date().getFullYear()) break; // Stop if we found a year
    }
  }
  
  console.log('Importing kilometers for month:', month, 'year:', year, 'sheetName:', sheetName);
  
  if (month === -1) {
    // Try to find month name in rawData
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
    if (!werknemerNaam || werknemerNaam.toLowerCase().includes('totaal') || 
        werknemerNaam.toLowerCase().includes('elke dag')) {
      continue; // Skip empty rows, totals, and special rows
    }
    
    console.log('Processing werknemer:', werknemerNaam, 'row', i);
    
    // Find werknemer
    let werknemer = werknemers.find(w => w.naam.toLowerCase() === werknemerNaam.toLowerCase());
    if (!werknemer) {
      console.log('⚠️ Werknemer not found:', werknemerNaam, '- Creating automatically...');
      // Auto-create werknemer
      try {
        werknemer = databaseOps.createWerknemer({
          naam: werknemerNaam,
          email: null,
          nummerplaat: null
        });
        imported.werknemers++;
        werknemers.push(werknemer); // Add to local array for subsequent lookups
        console.log('✓ Created new werknemer:', werknemer.id, werknemer.naam);
      } catch (err) {
        console.error('Error creating werknemer:', err);
        continue;
      }
    } else {
      console.log('✓ Werknemer found:', werknemer.id, werknemer.naam);
    }
    
    // Process each day column
    let importedForThisWerknemer = 0;
    for (const dayCol of dayColumns) {
      const cellValue = row[dayCol.index];
      
      // Skip empty cells (null, undefined, empty string, but NOT 0)
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        continue;
      }
      
      const day = dayCol.dayNumber;
      const dateObj = new Date(year, month - 1, day);
      
      // Skip invalid dates (e.g., Feb 30)
      if (dateObj.getDate() !== day || dateObj.getMonth() !== month - 1) {
        continue;
      }
      
      try {
        const cellStr = String(cellValue).trim();
        let kilometers = 0;
        
        // Check if it's a number (kilometers)
        if (cellStr !== '' && !isNaN(cellStr)) {
          kilometers = parseFloat(cellStr);
        }
        
        // Only create record if there are kilometers (greater than 0)
        if (kilometers > 0) {
          // Check if record already exists for this date
          const existing = databaseOps.getKilometers().find(k => 
            k.werknemerId === werknemer.id && 
            k.datum.startsWith(dateObj.toISOString().split('T')[0])
          );
          
          if (!existing) {
            databaseOps.createKilometer({
              werknemerId: werknemer.id,
              datum: dateObj.toISOString(),
              kilometers: kilometers,
              vanAdres: null,
              naarAdres: null,
              doel: null
            });
            imported.kilometers++;
            importedForThisWerknemer++;
            console.log('  ✓ Imported:', dateObj.toISOString().split('T')[0], `${kilometers} km`);
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
  
  console.log('=== MONTHLY GRID KM IMPORT COMPLETED ===');
  console.log('Total imported:', imported);
  console.log('========================================');
  
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
      year: year
    }
  };
}

ipcMain.handle('import:dagontvangsten', async (event, base64, fileName) => {
  try {
    // Create backup before import
    const { createBackup } = require('./database-simple');
    createBackup('before-import-dagontvangsten');
    
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
        // Check if record already exists for this date
        const allOntvangsten = databaseOps.getDagontvangsten();
        const dateStr = dateObj.toISOString().split('T')[0];
        const existing = allOntvangsten.find(o => {
          try {
            const storedDate = new Date(o.datum);
            const storedDateStr = storedDate.toISOString().split('T')[0];
            return storedDateStr === dateStr;
          } catch (e) {
            return false;
          }
        });
        
        if (existing) {
          // Update existing record instead of creating duplicate
          const categorieen = {
            '6': btw6,
            '12': btw12,
            '21': btw21
          };
          databaseOps.updateDagontvangst(existing.id, {
            datum: dateObj.toISOString(),
            totaal: totaal,
            categorieen: categorieen,
            opmerking: opmerking
          });
          imported.records++;
          console.log('Updated existing dagontvangst:', dateStr, totaal);
        } else {
          // Create new record
          databaseOps.createDagontvangst({
            datum: dateObj.toISOString(),
            totaal: totaal,
            btw6: btw6,
            btw12: btw12,
            btw21: btw21,
            opmerking: opmerking
          });
          imported.records++;
          console.log('Imported new dagontvangst:', dateStr, totaal);
        }
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
