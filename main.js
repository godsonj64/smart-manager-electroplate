const { app, BrowserWindow, ipcMain, dialog, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  const isMac = process.platform === 'darwin';
  const winOptions = {
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  };

  if (isMac) {
    // Mac: hide title bar but keep traffic lights (hiddenInset)
    winOptions.titleBarStyle = 'hiddenInset';
    winOptions.trafficLightPosition = { x: 12, y: 12 };
    winOptions.vibrancy = 'fullscreen-ui';
    winOptions.visualEffectState = 'active';
  } else {
    // Windows/Linux: remove native frame entirely – we draw our own title bar
    winOptions.frame = false;
  }

  mainWindow = new BrowserWindow(winOptions);

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers for file dialogs (CSV import/export, backup)
ipcMain.handle('dialog:openFile', async (event, filters) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: filters || [{ name: 'All Files', extensions: ['*'] }],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('dialog:saveFile', async (event, { defaultPath, filters }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath || '',
    filters: filters || [{ name: 'All Files', extensions: ['*'] }],
  });
  if (result.canceled) return null;
  return result.filePath;
});

// Basic path validation: only allow absolute paths to prevent arbitrary file access
function isValidPath(filePath) {
  return typeof filePath === 'string' && filePath.length > 0 && path.isAbsolute(filePath);
}

ipcMain.handle('file:read', async (event, filePath) => {
  if (!isValidPath(filePath)) {
    throw new Error('Invalid file path');
  }
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    throw new Error('Failed to read file: ' + err.message);
  }
});

ipcMain.handle('file:write', async (event, { filePath, data }) => {
  if (!isValidPath(filePath)) {
    throw new Error('Invalid file path');
  }
  try {
    fs.writeFileSync(filePath, data, 'utf-8');
    return true;
  } catch (err) {
    throw new Error('Failed to write file: ' + err.message);
  }
});

ipcMain.handle('clipboard:copy', async (event, text) => {
  clipboard.writeText(text);
  return true;
});

// Window control IPC (for frameless Windows/Linux)
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.handle('window:close', () => {
  mainWindow?.close();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
