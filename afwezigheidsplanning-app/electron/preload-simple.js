// Simpele preload
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('db', {
  get: (table) => ipcRenderer.invoke('db:get', table),
  set: (table, data) => ipcRenderer.invoke('db:set', table, data),
  add: (table, item) => ipcRenderer.invoke('db:add', table, item),
  update: (table, id, updates) => ipcRenderer.invoke('db:update', table, id, updates),
  delete: (table, id) => ipcRenderer.invoke('db:delete', table, id),
});

contextBridge.exposeInMainWorld('electronAPI', {
  importExcel: (base64, fileName, importType) => ipcRenderer.invoke('import:excel', base64, fileName, importType),
  analyzeExcel: (base64, fileName) => ipcRenderer.invoke('analyze:excel', base64, fileName),
  importDagontvangsten: (base64, fileName) => ipcRenderer.invoke('import:dagontvangsten', base64, fileName),
  importGratisCola: (base64, fileName) => ipcRenderer.invoke('import:gratiscola', base64, fileName),
});

