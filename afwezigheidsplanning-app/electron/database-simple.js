// Simpele JSON database - GEEN native modules nodig!
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

let dbPath = null;
let dbData = {
  werknemers: [],
  urenregistraties: [],
  afwezigheden: [],
  kilometers: [],
  maandKmStanden: [],
  dagontvangsten: [],
  gratisCola: []
};

// Database save optimization: batch saves to reduce disk I/O
let saveTimeout = null;
let pendingSave = false;
const SAVE_DEBOUNCE_MS = 100; // Wait 100ms before saving (batches rapid changes)

function getDatabasePath() {
  if (!dbPath) {
    const userDataPath = app.getPath('userData');
    const dbDir = path.join(userDataPath, 'afwezigheidsplanning-app');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbPath = path.join(dbDir, 'database.json');
  }
  return dbPath;
}

function getBackupDir() {
  const userDataPath = app.getPath('userData');
  const dbDir = path.join(userDataPath, 'afwezigheidsplanning-app');
  const backupDir = path.join(dbDir, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

function loadDatabase() {
  const filePath = getDatabasePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      
      // Try to parse the database
      try {
        dbData = JSON.parse(data);
        
        // Validate that dbData has the expected structure
        if (!dbData || typeof dbData !== 'object') {
          throw new Error('Database data is not an object');
        }
        
        // Ensure all required arrays exist
        if (!Array.isArray(dbData.werknemers)) dbData.werknemers = [];
        if (!Array.isArray(dbData.urenregistraties)) dbData.urenregistraties = [];
        if (!Array.isArray(dbData.afwezigheden)) dbData.afwezigheden = [];
        if (!Array.isArray(dbData.kilometers)) dbData.kilometers = [];
        if (!Array.isArray(dbData.maandKmStanden)) dbData.maandKmStanden = [];
        if (!Array.isArray(dbData.dagontvangsten)) dbData.dagontvangsten = [];
        if (!Array.isArray(dbData.gratisCola)) dbData.gratisCola = [];
        
        console.log(`✓ Database loaded successfully from: ${filePath}`);
        console.log(`  Records: werknemers=${dbData.werknemers.length}, uren=${dbData.urenregistraties.length}, afwezigheden=${dbData.afwezigheden.length}, km=${dbData.kilometers.length}, dagontvangsten=${dbData.dagontvangsten.length}, gratisCola=${dbData.gratisCola.length}`);
      } catch (parseError) {
        // CRITICAL: Don't overwrite the database file if parsing fails!
        // Create a backup first, then try to recover
        console.error('⚠ ERROR parsing database JSON:', parseError);
        console.error('  This could indicate database corruption.');
        
        // Create backup of corrupted file
        const backupPath = filePath + '.backup.' + Date.now();
        try {
          fs.copyFileSync(filePath, backupPath);
          console.log(`  ✓ Backup created: ${backupPath}`);
        } catch (backupError) {
          console.error('  ✗ Failed to create backup:', backupError);
        }
        
        // Try to load with a more lenient approach - keep existing data structure
        // Only reset if absolutely necessary
        console.warn('  ⚠ Attempting to preserve existing data structure...');
        
        // Keep the existing dbData structure (already initialized above)
        // Don't overwrite the file - let the user fix it manually
        console.error('  ✗ Database file appears corrupted. Data NOT loaded to prevent data loss.');
        console.error('  ✗ Please restore from backup or fix the database file manually.');
        console.error('  ✗ Backup location:', backupPath);
        
        // Don't save empty database - preserve the corrupted file for recovery
        // The app will continue with empty in-memory data, but won't overwrite the file
        return; // Exit without saving, preserving the corrupted file
      }
    } else {
      // File doesn't exist - initialize empty database
      console.log('Database file not found - initializing new database');
      dbData = {
        werknemers: [],
        urenregistraties: [],
        afwezigheden: [],
        kilometers: [],
        maandKmStanden: [],
        dagontvangsten: [],
        gratisCola: []
      };
      saveDatabase();
    }
  } catch (error) {
    // Only catch file system errors, not parse errors (handled above)
    console.error('✗ Error loading database (file system error):', error);
    console.error('  File path:', filePath);
    
    // Don't overwrite existing database if there's a file system error
    // Keep existing in-memory structure
    if (!fs.existsSync(filePath)) {
      // Only initialize if file truly doesn't exist
      dbData = {
        werknemers: [],
        urenregistraties: [],
        afwezigheden: [],
        kilometers: [],
        maandKmStanden: [],
        dagontvangsten: [],
        gratisCola: []
      };
      saveDatabase();
    } else {
      // File exists but can't be read - don't overwrite!
      console.error('  ⚠ Database file exists but cannot be read. Data NOT loaded to prevent data loss.');
    }
  }
}

// Create automatic backup before saving
function createBackup(reason = 'auto') {
  try {
    const filePath = getDatabasePath();
    if (!fs.existsSync(filePath)) {
      console.log('⚠ No database file to backup');
      return null;
    }
    
    const backupDir = getBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5); // YYYY-MM-DDTHH-MM-SS
    const backupFileName = `database-backup-${timestamp}-${reason}.json`;
    const backupPath = path.join(backupDir, backupFileName);
    
    // Copy current database to backup
    fs.copyFileSync(filePath, backupPath);
    
    console.log(`💾 Backup created: ${backupFileName}`);
    
    // Clean up old backups - keep only last 20 backups
    cleanupOldBackups(20);
    
    return backupPath;
  } catch (error) {
    console.error('✗ Error creating backup:', error);
    return null;
  }
}

// Clean up old backups, keeping only the most recent N backups
function cleanupOldBackups(keepCount = 20) {
  try {
    const backupDir = getBackupDir();
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('database-backup-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(backupDir, f),
        time: fs.statSync(path.join(backupDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Newest first
    
    // Delete old backups beyond keepCount
    if (files.length > keepCount) {
      const toDelete = files.slice(keepCount);
      toDelete.forEach(file => {
        try {
          fs.unlinkSync(file.path);
          console.log(`🗑️  Deleted old backup: ${file.name}`);
        } catch (error) {
          console.error(`✗ Error deleting backup ${file.name}:`, error);
        }
      });
    }
  } catch (error) {
    console.error('✗ Error cleaning up backups:', error);
  }
}

// Get list of available backups
function getBackupList() {
  try {
    const backupDir = getBackupDir();
    if (!fs.existsSync(backupDir)) {
      return [];
    }
    
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('database-backup-') && f.endsWith('.json'))
      .map(f => {
        const filePath = path.join(backupDir, f);
        const stats = fs.statSync(filePath);
        return {
          fileName: f,
          filePath: filePath,
          size: stats.size,
          created: stats.mtime,
          timestamp: stats.mtime.getTime()
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp); // Newest first
    
    return files;
  } catch (error) {
    console.error('✗ Error getting backup list:', error);
    return [];
  }
}

// Restore from backup
function restoreFromBackup(backupFilePath) {
  try {
    if (!fs.existsSync(backupFilePath)) {
      throw new Error('Backup file not found');
    }
    
    const filePath = getDatabasePath();
    
    // Create backup of current database before restoring
    createBackup('before-restore');
    
    // Copy backup to database location
    fs.copyFileSync(backupFilePath, filePath);
    
    // Reload database
    loadDatabase();
    
    console.log(`✓ Database restored from backup: ${path.basename(backupFilePath)}`);
    return true;
  } catch (error) {
    console.error('✗ Error restoring from backup:', error);
    throw error;
  }
}

// Internal save function (actual disk write)
function _saveDatabaseToDisk(createBackupBeforeSave = false) {
  const filePath = getDatabasePath();
  try {
    // Create backup if requested (for important operations)
    if (createBackupBeforeSave) {
      createBackup('before-save');
    }
    
    const jsonData = JSON.stringify(dbData, null, 2);
    const dataSize = jsonData.length;
    
    // Use writeFileSync to ensure synchronous write
    fs.writeFileSync(filePath, jsonData, 'utf8');
    
    // Force flush to disk - open file descriptor and sync
    const fd = fs.openSync(filePath, 'r+');
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    
    // Verify the file was written correctly
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    console.log(`✓ Database saved successfully to: ${filePath}`);
    console.log(`  Data size: ${dataSize} bytes, File size: ${fileSize} bytes`);
    console.log(`  Dagontvangsten records: ${dbData.dagontvangsten ? dbData.dagontvangsten.length : 0}`);
    
    if (dataSize !== fileSize) {
      console.warn(`⚠ WARNING: Data size (${dataSize}) != File size (${fileSize})!`);
    }
    
    return true;
  } catch (error) {
    console.error('✗ Error saving database:', error);
    console.error('  File path:', filePath);
    console.error('  Error details:', error.message, error.stack);
    throw error; // Re-throw to allow caller to handle
  }
}

// Public save function with debouncing for performance
function saveDatabase(createBackupBeforeSave = false, immediate = false) {
  // If immediate is true (for critical saves like on close), save immediately
  if (immediate) {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    pendingSave = false;
    return _saveDatabaseToDisk(createBackupBeforeSave);
  }
  
  // Mark that a save is pending
  pendingSave = true;
  
  // Clear existing timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  // Set new timeout to batch rapid changes
  saveTimeout = setTimeout(() => {
    if (pendingSave) {
      _saveDatabaseToDisk(createBackupBeforeSave);
      pendingSave = false;
    }
    saveTimeout = null;
  }, SAVE_DEBOUNCE_MS);
  
  return true;
}

function forceSaveDatabase() {
  console.log('🔄 Force saving database...');
  // Force immediate save (bypass debouncing)
  const result = saveDatabase(false, true);
  console.log('✓ Database force save completed');
  return result;
}

function initDatabase() {
  loadDatabase();
  return dbData;
}

// Helper functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Database operations
const databaseOps = {
  // Werknemer
  getWerknemers: (includeInactive = true) => {
    if (!includeInactive) {
      // Alleen actieve werknemers (voor dropdowns, overzichten)
      return dbData.werknemers.filter(w => {
        if (w.status !== undefined) return w.status === 'actief';
        return w.actief !== false;
      });
    }
    return dbData.werknemers;
  },

  getWerknemer: (id) => {
    return dbData.werknemers.find(w => w.id === id) || null;
  },

  createWerknemer: (data) => {
    const id = generateId();
    const werknemer = {
      id,
      naam: data.naam,
      email: data.email || null,
      nummerplaat: data.nummerplaat || null,
      type: data.type || 'werknemer', // 'student' of 'werknemer'
      status: data.status !== undefined ? data.status : 'actief', // 'actief' of 'inactief'
      vakantiedagenTotaal: data.vakantiedagenTotaal || 20,
      vakantiedagenOpgenomen: data.vakantiedagenOpgenomen || 0,
      actief: data.status !== 'inactief', // Backward compatibility
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbData.werknemers.push(werknemer);
    saveDatabase();
    return werknemer;
  },

  updateWerknemer: (id, data) => {
    const index = dbData.werknemers.findIndex(w => w.id === id);
    if (index !== -1) {
      // Ensure backward compatibility with actief field
      if (data.status !== undefined) {
        data.actief = data.status !== 'inactief';
      }
      dbData.werknemers[index] = {
        ...dbData.werknemers[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      saveDatabase();
      return dbData.werknemers[index];
    }
    return null;
  },

  deleteWerknemer: (id) => {
    const index = dbData.werknemers.findIndex(w => w.id === id);
    if (index !== -1) {
      // Op inactief zetten, niet echt verwijderen - blijft bewaard
      dbData.werknemers[index].actief = false;
      dbData.werknemers[index].status = 'inactief';
      dbData.werknemers[index].updatedAt = new Date().toISOString();
      saveDatabase();
    }
  },

  // Urenregistratie
  getUren: (filters = {}) => {
    let result = [...dbData.urenregistraties];
    
    if (filters.werknemerId) {
      result = result.filter(u => u.werknemerId === filters.werknemerId);
    }
    
    if (filters.maand) {
      result = result.filter(u => {
        const date = new Date(u.datum);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return month === filters.maand;
      });
    }
    
    return result.sort((a, b) => new Date(b.datum) - new Date(a.datum));
  },

  createUren: (data) => {
    const id = generateId();
    const uren = {
      id,
      werknemerId: data.werknemerId,
      datum: data.datum,
      uren: data.uren || 0,
      afwezigheid: data.afwezigheid || null,
      opmerking: data.opmerking || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbData.urenregistraties.push(uren);
    saveDatabase();
    return uren;
  },

  updateUren: (id, data) => {
    const index = dbData.urenregistraties.findIndex(u => u.id === id);
    if (index !== -1) {
      dbData.urenregistraties[index] = {
        ...dbData.urenregistraties[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      saveDatabase();
      return dbData.urenregistraties[index];
    }
    return null;
  },

  deleteUren: (id) => {
    const index = dbData.urenregistraties.findIndex(u => u.id === id);
    if (index !== -1) {
      dbData.urenregistraties.splice(index, 1);
      saveDatabase();
    }
  },

  // Afwezigheid
  getAfwezigheden: (filters = {}) => {
    let result = [...dbData.afwezigheden];
    
    if (filters.werknemerId) {
      result = result.filter(a => a.werknemerId === filters.werknemerId);
    }
    
    if (filters.type) {
      result = result.filter(a => a.type === filters.type);
    }
    
    if (filters.maand) {
      result = result.filter(a => {
        const startDate = new Date(a.startDatum);
        const month = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        return month === filters.maand;
      });
    }
    
    return result.sort((a, b) => new Date(b.startDatum) - new Date(a.startDatum));
  },

  createAfwezigheid: (data) => {
    const id = generateId();
    const afwezigheid = {
      id,
      werknemerId: data.werknemerId,
      startDatum: data.startDatum,
      eindDatum: data.eindDatum,
      type: data.type,
      uren: data.uren || null,
      opmerking: data.opmerking || null,
      goedgekeurd: data.goedgekeurd || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbData.afwezigheden.push(afwezigheid);
    saveDatabase();
    return afwezigheid;
  },

  updateAfwezigheid: (id, data) => {
    const index = dbData.afwezigheden.findIndex(a => a.id === id);
    if (index !== -1) {
      dbData.afwezigheden[index] = {
        ...dbData.afwezigheden[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      saveDatabase();
      return dbData.afwezigheden[index];
    }
    return null;
  },

  deleteAfwezigheid: (id) => {
    const index = dbData.afwezigheden.findIndex(a => a.id === id);
    if (index !== -1) {
      dbData.afwezigheden.splice(index, 1);
      saveDatabase();
    }
  },

  // Kilometer
  getKilometers: (filters = {}) => {
    let result = [...dbData.kilometers];
    
    if (filters.werknemerId) {
      result = result.filter(k => k.werknemerId === filters.werknemerId);
    }
    
    if (filters.maand) {
      result = result.filter(k => {
        const date = new Date(k.datum);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return month === filters.maand;
      });
    }
    
    return result.sort((a, b) => new Date(b.datum) - new Date(a.datum));
  },

  createKilometer: (data) => {
    const id = generateId();
    const kilometer = {
      id,
      werknemerId: data.werknemerId,
      datum: data.datum,
      kilometers: data.kilometers,
      vanAdres: data.vanAdres || null,
      naarAdres: data.naarAdres || null,
      doel: data.doel || null,
      opmerking: data.opmerking || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbData.kilometers.push(kilometer);
    saveDatabase();
    return kilometer;
  },

  updateKilometer: (id, data) => {
    const index = dbData.kilometers.findIndex(k => k.id === id);
    if (index !== -1) {
      dbData.kilometers[index] = {
        ...dbData.kilometers[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      saveDatabase();
      return dbData.kilometers[index];
    }
    return null;
  },

  deleteKilometer: (id) => {
    const index = dbData.kilometers.findIndex(k => k.id === id);
    if (index !== -1) {
      dbData.kilometers.splice(index, 1);
      saveDatabase();
    }
  },

  // MaandKmStand
  getMaandKmStanden: (filters = {}) => {
    let result = [...dbData.maandKmStanden];
    
    if (filters.werknemerId) {
      result = result.filter(m => m.werknemerId === filters.werknemerId);
    }
    
    if (filters.jaar) {
      result = result.filter(m => m.jaar === filters.jaar);
    }
    
    if (filters.maand) {
      result = result.filter(m => m.maand === filters.maand);
    }
    
    return result.sort((a, b) => {
      if (a.jaar !== b.jaar) return b.jaar - a.jaar;
      return b.maand - a.maand;
    });
  },

  createMaandKmStand: (data) => {
    const id = generateId();
    const maandKmStand = {
      id,
      werknemerId: data.werknemerId,
      jaar: data.jaar,
      maand: data.maand,
      beginKmStand: data.beginKmStand,
      eindKmStand: data.eindKmStand || null,
      elkeDagGereden: data.elkeDagGereden || null,
      handtekening: data.handtekening || null,
      getekendOp: data.getekendOp || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbData.maandKmStanden.push(maandKmStand);
    saveDatabase();
    return maandKmStand;
  },

  updateMaandKmStand: (id, data) => {
    const index = dbData.maandKmStanden.findIndex(m => m.id === id);
    if (index !== -1) {
      dbData.maandKmStanden[index] = {
        ...dbData.maandKmStanden[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      saveDatabase();
      return dbData.maandKmStanden[index];
    }
    return null;
  },

  deleteMaandKmStand: (id) => {
    const index = dbData.maandKmStanden.findIndex(m => m.id === id);
    if (index !== -1) {
      dbData.maandKmStanden.splice(index, 1);
      saveDatabase();
    }
  },

  // Dagontvangsten
  getDagontvangsten: (filters = {}) => {
    let result = [...dbData.dagontvangsten];
    if (filters.maand) {
      result = result.filter(d => {
        const date = new Date(d.datum);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return month === filters.maand;
      });
    }
    return result.sort((a, b) => new Date(a.datum) - new Date(b.datum));
  },

  createDagontvangst: (data) => {
    const id = generateId();
    // Build categorieen object if not provided (for UI compatibility)
    const categorieen = data.categorieen || {
      '6': data.btw6 || 0,
      '12': data.btw12 || 0,
      '21': data.btw21 || 0
    };
    const dagontvangst = {
      id,
      datum: data.datum,
      totaal: data.totaal || 0,
      btw6: data.btw6 || 0,
      btw12: data.btw12 || 0,
      btw21: data.btw21 || 0,
      opmerking: data.opmerking || null,
      categorieen: categorieen,  // Add categorieen for UI compatibility
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbData.dagontvangsten.push(dagontvangst);
    saveDatabase();
    return dagontvangst;
  },

  updateDagontvangst: (id, data) => {
    const index = dbData.dagontvangsten.findIndex(d => d.id === id);
    if (index !== -1) {
      // CRITICAL FIX: Preserve existing categorieen and merge with new values
      // Don't clear existing data if new categorieen is empty
      const existingCategorieen = dbData.dagontvangsten[index].categorieen || {};
      
      // If data.categorieen is provided (even if empty object), merge it with existing
      // If data.categorieen is not provided, use individual btw6/btw12/btw21 values or keep existing
      let newCategorieen;
      if (data.categorieen !== undefined) {
        // Merge: existing values are preserved, new values override
        newCategorieen = {
          ...existingCategorieen,
          ...data.categorieen  // New values override existing ones
        };
      } else {
        // Use individual btw6/btw12/btw21 values or keep existing
        newCategorieen = {
          '6': data.btw6 !== undefined ? data.btw6 : existingCategorieen['6'] || 0,
          '12': data.btw12 !== undefined ? data.btw12 : existingCategorieen['12'] || 0,
          '21': data.btw21 !== undefined ? data.btw21 : existingCategorieen['21'] || 0
        };
      }
      
      dbData.dagontvangsten[index] = {
        ...dbData.dagontvangsten[index],
        ...data,
        categorieen: newCategorieen,
        updatedAt: new Date().toISOString()
      };
      saveDatabase();
      return dbData.dagontvangsten[index];
    }
    return null;
  },

  deleteDagontvangst: (id) => {
    const index = dbData.dagontvangsten.findIndex(d => d.id === id);
    if (index !== -1) {
      dbData.dagontvangsten.splice(index, 1);
      saveDatabase();
    }
  },

  // Gratis Cola
  getGratisCola: (filters = {}) => {
    let result = [...dbData.gratisCola];
    if (filters.jaar) {
      result = result.filter(g => {
        const date = new Date(g.datum);
        return date.getFullYear() === filters.jaar;
      });
    }
    return result.sort((a, b) => new Date(a.datum) - new Date(b.datum));
  },

  createGratisCola: (data) => {
    const id = generateId();
    const gratisCola = {
      id,
      datum: data.datum,
      gratis: data.gratis || 0,
      verkocht: data.verkocht || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbData.gratisCola.push(gratisCola);
    saveDatabase();
    return gratisCola;
  },

  updateGratisCola: (id, data) => {
    const index = dbData.gratisCola.findIndex(g => g.id === id);
    if (index !== -1) {
      dbData.gratisCola[index] = {
        ...dbData.gratisCola[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      saveDatabase();
      return dbData.gratisCola[index];
    }
    return null;
  },

  deleteGratisCola: (id) => {
    const index = dbData.gratisCola.findIndex(g => g.id === id);
    if (index !== -1) {
      dbData.gratisCola.splice(index, 1);
      saveDatabase();
    }
  }
};

module.exports = {
  initDatabase,
  databaseOps,
  forceSaveDatabase,
  saveDatabase,
  createBackup,
  getBackupList,
  restoreFromBackup,
  getBackupDir
};








