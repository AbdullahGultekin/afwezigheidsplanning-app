// SIMPELE Electron App - GEWOON WERKEN!
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

let mainWindow = null;
let dbPath = null;
let dbData = {
  werknemers: [],
  uren: [],
  kilometers: [],
  dagontvangsten: [],
  gratisCola: []
};

// Database functies
function getDbPath() {
  if (!dbPath) {
    const userData = app.getPath('userData');
    const dbDir = path.join(userData, 'afwezigheidsplanning');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbPath = path.join(dbDir, 'data.json');
  }
  return dbPath;
}

function loadDatabase() {
  const filePath = getDbPath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      dbData = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading database:', error);
    dbData = { werknemers: [], uren: [], kilometers: [], dagontvangsten: [], gratisCola: [] };
  }
}

function saveDatabase() {
  const filePath = getDbPath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Pita Pizza Napoli',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-simple.js')
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    show: false
  });

  // Load HTML file
  const htmlPath = path.join(__dirname, '../app-simple/index.html');
  if (fs.existsSync(htmlPath)) {
    mainWindow.loadFile(htmlPath);
  } else {
    // Fallback: maak simpele HTML
    mainWindow.loadURL('data:text/html,<h1>App wordt geladen...</h1><p>Maak app-simple/index.html aan</p>');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('db:get', (event, table) => {
  return dbData[table] || [];
});

ipcMain.handle('db:set', (event, table, data) => {
  dbData[table] = data;
  saveDatabase();
  return true;
});

ipcMain.handle('db:add', (event, table, item) => {
  if (!dbData[table]) {
    dbData[table] = [];
  }
  item.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  dbData[table].push(item);
  saveDatabase();
  return item;
});

ipcMain.handle('db:update', (event, table, id, updates) => {
  if (!dbData[table]) return null;
  const index = dbData[table].findIndex(item => item.id === id);
  if (index !== -1) {
    dbData[table][index] = { ...dbData[table][index], ...updates };
    saveDatabase();
    return dbData[table][index];
  }
  return null;
});

ipcMain.handle('db:delete', (event, table, id) => {
  if (!dbData[table]) return false;
  const index = dbData[table].findIndex(item => item.id === id);
  if (index !== -1) {
    dbData[table].splice(index, 1);
    saveDatabase();
    return true;
  }
  return false;
});

// Excel Import Handler
ipcMain.handle('import:excel', async (event, base64, fileName, importType) => {
  try {
    console.log('Import started:', fileName, importType);
    
    if (!base64) {
      throw new Error('Geen bestand data ontvangen');
    }
    
    const buffer = Buffer.from(base64, 'base64');
    console.log('Buffer size:', buffer.length);
    
    if (buffer.length === 0) {
      throw new Error('Bestand is leeg');
    }
    
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    console.log('Workbook sheets:', workbook.SheetNames);
    
    let importedWerknemers = 0;
    let importedUren = 0;
    let importedKilometers = 0;

    const monthNames = [
      'januari', 'februari', 'maart', 'april', 'mei', 'juni',
      'juli', 'augustus', 'september', 'oktober', 'november', 'december'
    ];

    for (const sheetName of workbook.SheetNames) {
      if (sheetName.toLowerCase() === 'werknemers') continue;
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length < 5) continue;

      const monthIndex = monthNames.findIndex(m => sheetName.toLowerCase().includes(m));
      if (monthIndex === -1) continue;

      // Detect year from filename or sheet name (default to 2025)
      let year = 2025;
      if (fileName) {
        const yearMatch = fileName.match(/20(\d{2})/);
        if (yearMatch) {
          year = parseInt('20' + yearMatch[1]);
        }
      }
      // Also check sheet name for year
      const sheetYearMatch = sheetName.match(/20(\d{2})/);
      if (sheetYearMatch) {
        year = parseInt('20' + sheetYearMatch[1]);
      }
      
      // Find header row
      let nameColumnIndex = -1;
      let dayStartColumnIndex = -1;
      let dataStartRow = -1;

      // Zoek header rij - flexibeler zoeken
      for (let i = 0; i < Math.min(data.length, 15); i++) {
        const row = data[i];
        if (!row || !Array.isArray(row)) continue;
        
        for (let j = 0; j < row.length; j++) {
          const cell = row[j];
          if (typeof cell === 'string') {
            const cellLower = cell.toLowerCase();
            // Zoek naar "naam" of "werknemer" in de cel
            if ((cellLower.includes('naam') && cellLower.includes('werknemer')) || 
                cellLower.includes('naam werknemer') ||
                cellLower === 'naam') {
              nameColumnIndex = j;
              dataStartRow = i + 1;
              
              // Zoek waar de dagen beginnen (kolom met "1" of "dag 1")
              for (let k = j + 1; k < Math.min(row.length, j + 35); k++) {
                const dayCell = row[k];
                if (dayCell === 1 || dayCell === '1' || 
                    (typeof dayCell === 'string' && dayCell.toLowerCase().includes('dag 1')) ||
                    (typeof dayCell === 'string' && dayCell.trim() === '1')) {
                  dayStartColumnIndex = k;
                  break;
                }
              }
              break;
            }
          }
        }
        if (nameColumnIndex !== -1) break;
      }

      if (nameColumnIndex === -1 || dataStartRow === -1) {
        console.log(`Skipping sheet ${sheetName}: No header found`);
        continue;
      }
      
      if (!dayStartColumnIndex) {
        dayStartColumnIndex = nameColumnIndex + 1;
      }
      
      console.log(`Processing ${sheetName}: nameCol=${nameColumnIndex}, dayStart=${dayStartColumnIndex}, dataStart=${dataStartRow}`);

      // Process rows
      for (let i = dataStartRow; i < data.length; i++) {
        const row = data[i];
        const naam = row[nameColumnIndex];

        if (!naam || typeof naam !== 'string' || naam.trim() === '' || 
            naam.toLowerCase().includes('totaal')) {
          continue;
        }

        // Find or create werknemer
        let werknemer = dbData.werknemers.find(w => w.naam === naam.trim());
        if (!werknemer) {
          werknemer = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            naam: naam.trim(),
            actief: true
          };
          dbData.werknemers.push(werknemer);
          importedWerknemers++;
        }

        // Process days
        for (let day = 1; day <= 31; day++) {
          const columnIndex = dayStartColumnIndex + (day - 1);
          if (columnIndex >= row.length || columnIndex < 0) break;

          const cellValue = row[columnIndex];
          const datum = new Date(year, monthIndex, day);
          if (datum.getMonth() !== monthIndex) continue;

          const dateStr = datum.toISOString().split('T')[0];

          if (importType === 'kilometers') {
            // Import kilometers
            if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
              const kmValue = typeof cellValue === 'number' ? cellValue : parseFloat(cellValue);
              if (!isNaN(kmValue) && kmValue > 0) {
                const existing = dbData.kilometers.find(k => 
                  k.werknemerId === werknemer.id && 
                  new Date(k.datum).toISOString().split('T')[0] === dateStr
                );
                if (existing) {
                  existing.kilometers = kmValue;
                } else {
                  dbData.kilometers.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    werknemerId: werknemer.id,
                    datum: datum.toISOString(),
                    kilometers: kmValue
                  });
                }
                importedKilometers++;
              }
            }
          } else {
            // Import alleen uren (geen afwezigheden meer)
            if (typeof cellValue === 'number' && cellValue > 0) {
              // Uren
              const existing = dbData.uren.find(u => 
                u.werknemerId === werknemer.id && 
                new Date(u.datum).toISOString().split('T')[0] === dateStr
              );
              if (existing) {
                existing.uren = cellValue;
              } else {
                dbData.uren.push({
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                  werknemerId: werknemer.id,
                  datum: datum.toISOString(),
                  uren: cellValue
                });
              }
              importedUren++;
            }
          }
        }
      }
    }

    saveDatabase();

    console.log('Import completed:', {
      werknemers: importedWerknemers,
      uren: importedUren,
      kilometers: importedKilometers
    });

    return {
      imported: {
        werknemers: importedWerknemers,
        uren: importedUren,
        kilometers: importedKilometers
      }
    };
  } catch (error) {
    console.error('Import error:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Import fout: ${error.message || error.toString()}`);
  }
});

// Excel Analysis Handler - Read and analyze Excel structure
ipcMain.handle('analyze:excel', async (event, base64, fileName) => {
  try {
    if (!base64) {
      throw new Error('Geen bestand data ontvangen');
    }
    
    const buffer = Buffer.from(base64, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    const analysis = {
      fileName: fileName,
      sheets: workbook.SheetNames.map(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        
        // Analyze first few rows to understand structure
        const firstRows = data.slice(0, 10);
        const headers = firstRows[0] || [];
        
        return {
          name: sheetName,
          rowCount: data.length,
          columnCount: headers.length,
          headers: headers,
          sampleData: firstRows.slice(0, 5)
        };
      })
    };
    
    return analysis;
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error(`Analyse fout: ${error.message || error.toString()}`);
  }
});

// Import Dagontvangsten Handler
ipcMain.handle('import:dagontvangsten', async (event, base64, fileName) => {
  try {
    console.log('Import dagontvangsten started:', fileName);
    
    if (!base64) {
      throw new Error('Geen bestand data ontvangen');
    }
    
    const buffer = Buffer.from(base64, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    console.log('Workbook sheets:', workbook.SheetNames);
    
    let importedRecords = 0;
    const monthNames = [
      'januari', 'februari', 'maart', 'april', 'mei', 'juni',
      'juli', 'augustus', 'september', 'oktober', 'november', 'december'
    ];
    
    // Detect year from filename
    let year = 2025;
    const yearMatch = fileName.match(/20(\d{2})/);
    if (yearMatch) {
      year = parseInt('20' + yearMatch[1]);
    }
    
    for (const sheetName of workbook.SheetNames) {
      const monthIndex = monthNames.findIndex(m => sheetName.toLowerCase().includes(m));
      if (monthIndex === -1) continue;
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      if (data.length < 3) continue;
      
      // Find header row (usually row 2, index 1)
      let headerRow = 1;
      let datumCol = -1;
      let totaalCol = -1;
      const categorieCols = [];
      
      for (let i = 0; i < Math.min(5, data.length); i++) {
        const row = data[i];
        for (let j = 0; j < row.length; j++) {
          const cell = row[j];
          if (typeof cell === 'string') {
            if (cell.toLowerCase().includes('datum')) {
              datumCol = j;
              headerRow = i;
            } else if (cell.toLowerCase().includes('totaal')) {
              totaalCol = j;
            }
          } else if (typeof cell === 'number' && cell > 0 && cell < 100) {
            // Category column (like 6, 12, 21)
            if (i === headerRow) {
              categorieCols.push({ col: j, naam: cell.toString() });
            }
          }
        }
      }
      
      if (datumCol === -1 || totaalCol === -1) {
        console.log(`Skipping sheet ${sheetName}: No header found`);
        continue;
      }
      
      console.log(`Processing ${sheetName}: datumCol=${datumCol}, totaalCol=${totaalCol}, categorieCols=${categorieCols.length}`);
      
      // Process data rows (start after header)
      for (let i = headerRow + 1; i < data.length; i++) {
        const row = data[i];
        const datumValue = row[datumCol];
        
        if (!datumValue) continue;
        
        // Convert Excel date to ISO string
        let datum = null;
        if (typeof datumValue === 'number' && datumValue > 40000) {
          // Excel date serial number
          const excelDate = XLSX.SSF.parse_date_code(datumValue);
          datum = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
        } else if (typeof datumValue === 'string') {
          datum = new Date(datumValue);
        }
        
        if (!datum || isNaN(datum.getTime())) continue;
        
        // Check if date matches the month
        if (datum.getMonth() !== monthIndex) continue;
        
        const dateStr = datum.toISOString().split('T')[0];
        const totaal = parseFloat(row[totaalCol]) || 0;
        
        // Get category values
        const categorieen = {};
        categorieCols.forEach(cat => {
          const waarde = parseFloat(row[cat.col]) || 0;
          if (waarde > 0) {
            categorieen[cat.naam] = waarde;
          }
        });
        
        // Check if exists
        const existing = dbData.dagontvangsten.find(d => 
          new Date(d.datum).toISOString().split('T')[0] === dateStr
        );
        
        if (existing) {
          existing.totaal = totaal;
          existing.categorieen = categorieen;
        } else {
          dbData.dagontvangsten.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            datum: datum.toISOString(),
            totaal: totaal,
            categorieen: categorieen,
            opmerking: row[datumCol + 1] || null // "Ontvangsten" column
          });
        }
        importedRecords++;
      }
    }
    
    saveDatabase();
    
    console.log('Dagontvangsten import completed:', importedRecords);
    
    return {
      imported: {
        records: importedRecords
      }
    };
  } catch (error) {
    console.error('Import error:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Import fout: ${error.message || error.toString()}`);
  }
});

// Import Gratis Cola Handler
ipcMain.handle('import:gratiscola', async (event, base64, fileName) => {
  try {
    console.log('Import gratis cola started:', fileName);
    
    if (!base64) {
      throw new Error('Geen bestand data ontvangen');
    }
    
    const buffer = Buffer.from(base64, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    console.log('Workbook sheets:', workbook.SheetNames);
    
    let importedRecords = 0;
    
    // Detect year from filename
    let year = 2025;
    const yearMatch = fileName.match(/20(\d{2})/);
    if (yearMatch) {
      year = parseInt('20' + yearMatch[1]);
    }
    
    // Process first sheet (usually "Blad1")
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    if (data.length < 32) {
      throw new Error('Bestand heeft niet genoeg rijen');
    }
    
    // Structure: Each row = day (1-31), columns = months (every 4 columns: date, gratis, verkocht, aankoopprijs)
    // Row 0 = day 1, Row 1 = day 2, etc.
    // Column 0 = day number, then every 4 columns = month data
    
    // Find how many months (count date columns)
    let monthCount = 0;
    for (let col = 0; col < data[0].length; col += 4) {
      const dateValue = data[0] && data[0][col];
      if (dateValue && (typeof dateValue === 'number' && dateValue > 40000 || typeof dateValue === 'string')) {
        monthCount++;
      } else {
        break;
      }
    }
    
    console.log(`Found ${monthCount} months in the file`);
    
    // Process each month
    for (let monthIdx = 0; monthIdx < monthCount; monthIdx++) {
      const dateCol = monthIdx * 4;
      const gratisCol = dateCol + 1;
      const verkochtCol = dateCol + 2;
      // Note: Third column is calculated (verkocht * 2.30), we don't import it
      
      // Get month from first row date
      const firstDateValue = data[0][dateCol];
      let month = 1;
      let monthYear = year;
      
      if (typeof firstDateValue === 'number' && firstDateValue > 40000) {
        const excelDate = XLSX.SSF.parse_date_code(firstDateValue);
        month = excelDate.m;
        monthYear = excelDate.y;
      }
      
      // Process each day (rows 0-30 = days 1-31)
      for (let rowIdx = 0; rowIdx < 31; rowIdx++) {
        const day = rowIdx + 1;
        const dateValue = data[rowIdx][dateCol];
        const gratis = parseFloat(data[rowIdx][gratisCol]) || 0;
        const verkocht = parseFloat(data[rowIdx][verkochtCol]) || 0;
        
        if (!dateValue || (gratis === 0 && verkocht === 0)) continue;
        
        // Create date
        let datum = null;
        if (typeof dateValue === 'number' && dateValue > 40000) {
          const excelDate = XLSX.SSF.parse_date_code(dateValue);
          datum = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
        } else if (typeof dateValue === 'string') {
          datum = new Date(dateValue);
        }
        
        if (!datum || isNaN(datum.getTime())) continue;
        
        const dateStr = datum.toISOString().split('T')[0];
        
        // Check if exists
        const existing = dbData.gratisCola.find(g => 
          new Date(g.datum).toISOString().split('T')[0] === dateStr
        );
        
        if (existing) {
          existing.gratis = gratis;
          existing.verkocht = verkocht;
        } else {
          dbData.gratisCola.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            datum: datum.toISOString(),
            gratis: gratis,
            verkocht: verkocht
          });
        }
        importedRecords++;
      }
    }
    
    saveDatabase();
    
    console.log('Gratis Cola import completed:', importedRecords);
    
    return {
      imported: {
        records: importedRecords
      }
    };
  } catch (error) {
    console.error('Import error:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Import fout: ${error.message || error.toString()}`);
  }
});

// App lifecycle
app.whenReady().then(() => {
  loadDatabase();
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

