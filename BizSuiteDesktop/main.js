const { app, BrowserWindow } = require('electron');
const path = require('path');

// Parse command line arguments
const isDebug = process.argv.includes('--debug') || process.env.NODE_ENV !== 'production';

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
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
  win.loadFile(indexPath)
    .then(() => {
      console.log('[BizSuite Desktop] Successfully loaded index.html');
    })
    .catch((err) => {
      console.error('[BizSuite Desktop] Failed to load index.html:', err);
      console.error('[BizSuite Desktop] Attempted path:', indexPath);
    });

  // Show window when ready to prevent white flash
  win.once('ready-to-show', () => {
    win.show();
    
    // Open DevTools in debug mode
    if (isDebug) {
      win.webContents.openDevTools();
      console.log('[BizSuite Desktop] DevTools opened (debug mode)');
    }
  });

  // Handle window closed
  win.on('closed', () => {
    console.log('[BizSuite Desktop] Window closed');
  });

  // Log any load failures
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('[BizSuite Desktop] Load failed:', errorCode, errorDescription);
  });

  // Log console messages from renderer
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (isDebug) {
      console.log('[Renderer]', message);
    }
  });
}

// App ready
app.whenReady().then(() => {
  console.log('[BizSuite Desktop] App ready, creating window...');
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
