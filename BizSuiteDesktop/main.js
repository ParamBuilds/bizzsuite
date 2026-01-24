const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Only load auto-updater in production (it may not be available in dev)
let autoUpdater = null;
try {
  autoUpdater = require('./auto-updater');
} catch (e) {
  console.log('[BizSuite Desktop] Auto-updater not available:', e.message);
}

// Parse command line arguments
const isDebug = process.argv.includes('--debug') || process.env.NODE_ENV !== 'production';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    // Professional desktop app appearance
    icon: path.join(__dirname, 'dist', 'favicon.ico'),
    backgroundColor: '#ffffff',
    show: false, // Don't show until ready
    titleBarStyle: 'default',
    autoHideMenuBar: true
  });

  // Resolve the path to index.html
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  // Log for debugging
  console.log('[BizSuite Desktop] Loading from:', indexPath);
  console.log('[BizSuite Desktop] Debug mode:', isDebug);
  console.log('[BizSuite Desktop] __dirname:', __dirname);

  // Load the app
  mainWindow.loadFile(indexPath)
    .then(() => {
      console.log('[BizSuite Desktop] Successfully loaded index.html');
    })
    .catch((err) => {
      console.error('[BizSuite Desktop] Failed to load index.html:', err);
      console.error('[BizSuite Desktop] Attempted path:', indexPath);
    });

  // Show window when ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Initialize auto-updater in production
    if (autoUpdater && !isDebug) {
      autoUpdater.initAutoUpdater(mainWindow);
    }
    
    // Open DevTools in debug mode
    if (isDebug) {
      mainWindow.webContents.openDevTools();
      console.log('[BizSuite Desktop] DevTools opened (debug mode)');
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    console.log('[BizSuite Desktop] Window closed');
    mainWindow = null;
  });

  // Log any load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('[BizSuite Desktop] Load failed:', errorCode, errorDescription);
  });

  // Log console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (isDebug) {
      console.log('[Renderer]', message);
    }
  });

  return mainWindow;
}

// IPC Handlers
ipcMain.handle('get-version', () => {
  return app.getVersion();
});

// Listen for manual update check request
ipcMain.on('check-for-updates', (event) => {
  console.log('[BizSuite Desktop] Manual update check requested');
  if (autoUpdater) {
    autoUpdater.checkForUpdates();
  }
});

// Listen for download update request
ipcMain.on('download-update', (event) => {
  console.log('[BizSuite Desktop] Download update requested');
  if (autoUpdater) {
    autoUpdater.downloadUpdate();
  }
});

// Listen for install update request
ipcMain.on('install-update', (event) => {
  console.log('[BizSuite Desktop] Install update requested');
  if (autoUpdater) {
    autoUpdater.installUpdate();
  }
});

// App ready
app.whenReady().then(() => {
  console.log('[BizSuite Desktop] App ready, creating window...');
  console.log('[BizSuite Desktop] App version:', app.getVersion());
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[BizSuite Desktop] Uncaught exception:', error);
});
