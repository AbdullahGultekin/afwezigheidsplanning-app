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
  maandKmStanden: []
};

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

function loadDatabase() {
  const filePath = getDatabasePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      dbData = JSON.parse(data);
    } else {
      // Initialize empty database
      saveDatabase();
    }
  } catch (error) {
    console.error('Error loading database:', error);
    dbData = {
      werknemers: [],
      urenregistraties: [],
      afwezigheden: [],
      kilometers: [],
      maandKmStanden: []
    };
    saveDatabase();
  }
}

function saveDatabase() {
  const filePath = getDatabasePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
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
  getWerknemers: () => {
    return dbData.werknemers.filter(w => w.actief !== false);
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
      vakantiedagenTotaal: data.vakantiedagenTotaal || 20,
      vakantiedagenOpgenomen: data.vakantiedagenOpgenomen || 0,
      actief: true,
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
      dbData.werknemers[index].actief = false;
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
      uren: data.uren,
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
  }
};

module.exports = {
  initDatabase,
  databaseOps
};




