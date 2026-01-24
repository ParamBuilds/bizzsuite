const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Store reference to main window for notifications
let mainWindow = null;

function initAutoUpdater(window) {
  mainWindow = window;
  
  // Check for updates on startup (with delay to not block app start)
  setTimeout(() => {
    checkForUpdates();
  }, 5000);
  
  // Check for updates every 30 minutes
  setInterval(() => {
    checkForUpdates();
  }, 30 * 60 * 1000);
}

function checkForUpdates() {
  console.log('[AutoUpdater] Checking for updates...');
  autoUpdater.checkForUpdates().catch(err => {
    console.log('[AutoUpdater] Error checking for updates:', err.message);
  });
}

// Update available
autoUpdater.on('update-available', (info) => {
  console.log('[AutoUpdater] Update available:', info.version);
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: `A new version (${info.version}) is available!`,
    detail: 'Would you like to download and install it now?',
    buttons: ['Download', 'Later'],
    defaultId: 0,
    cancelId: 1
  }).then(({ response }) => {
    if (response === 0) {
      autoUpdater.downloadUpdate();
      sendStatusToWindow('downloading', `Downloading version ${info.version}...`);
    }
  });
});

// No update available
autoUpdater.on('update-not-available', (info) => {
  console.log('[AutoUpdater] No update available, current version is latest');
});

// Download progress
autoUpdater.on('download-progress', (progressObj) => {
  const percent = Math.round(progressObj.percent);
  console.log(`[AutoUpdater] Download progress: ${percent}%`);
  sendStatusToWindow('progress', `Downloading update: ${percent}%`);
});

// Update downloaded
autoUpdater.on('update-downloaded', (info) => {
  console.log('[AutoUpdater] Update downloaded:', info.version);
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: 'Update downloaded successfully!',
    detail: 'The application will restart to install the update.',
    buttons: ['Restart Now', 'Later'],
    defaultId: 0,
    cancelId: 1
  }).then(({ response }) => {
    if (response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });
});

// Error handling
autoUpdater.on('error', (err) => {
  console.error('[AutoUpdater] Error:', err.message);
  sendStatusToWindow('error', 'Update check failed');
});

// Send status to renderer process
function sendStatusToWindow(status, message) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update-status', { status, message });
  }
}

module.exports = { initAutoUpdater, checkForUpdates };
