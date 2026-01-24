const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // App version
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // Update events
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (event, data) => callback(data));
  },
  
  // Check for updates manually
  checkForUpdates: () => {
    ipcRenderer.send('check-for-updates');
    return true;
  },
  
  // Download update
  downloadUpdate: () => ipcRenderer.send('download-update'),
  
  // Install update
  installUpdate: () => ipcRenderer.send('install-update'),
  
  // Platform info
  platform: process.platform,
  isElectron: true
});
