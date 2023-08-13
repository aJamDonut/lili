import { app, BrowserWindow, nativeTheme } from 'electron';
import path from 'path';
import os from 'os';
import { setupElectronStorageHandlers } from './src/services/storage/ElectronStorage';
import { setupElectronEngineHandlers } from './src/services/lili/drivers/Engine/ElectronEngine';
import { setupElectronWindowHandlers } from './src/services/window';
import { dialog, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';

//IMPORTANT: DO NOT USE 'electron/remote' that is for people who don't understand Web Security!!!!!
//I don't even care that it's in the official documentation. It's wrong! Just add to the context bridge correctly.

//Any handlers for frontend to backend
//In future, we could factory these into remote, databases, etc.

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'));
  }
} catch (_) {}

let mainWindow: BrowserWindow | undefined;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    minHeight: 350,
    minWidth: 700,
    useContentSize: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });

  const handleRedirect = (e: Event, url: string) => {
    if (!mainWindow) {
      return;
    }
    if (url != mainWindow.webContents.getURL()) {
      e.preventDefault();
      require('electron').shell.openExternal(url);
    }
  };

  //They think will-navigate doesn't exist.
  mainWindow.webContents.on('will-navigate', handleRedirect);
  //They think new-window doesn't exist.
  mainWindow.webContents.on('new-window', handleRedirect);

  console.log('feed url', autoUpdater.getFeedURL());

  mainWindow.once('ready-to-show', () => {
    console.log('feed url', autoUpdater.getFeedURL());
    autoUpdater.checkForUpdatesAndNotify();
  });

  autoUpdater.on('update-available', () => {
    showInfo('New version available! Downloading now...');
  });
  autoUpdater.on('update-downloaded', () => {
    showInfo('Restart to use latest version');
  });

  ipcMain.handle('electron:chooseFolderDialog', async () => {
    if (!mainWindow) return;
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });
    if (canceled) {
      return;
    } else {
      console.log('File dialog', filePaths);
      return filePaths[0];
    }
  });
}

import { injectCLIApp } from './src/services/cli';
import { showInfo } from './src/services/event';

async function setup() {
  //Production?
  await setupElectronStorageHandlers(path.join(app.getPath('userData'), 'UserData'), 'Data');

  //Dev:
  //await setupElectronStorageHandlers('UserData', 'Data');
  await setupElectronEngineHandlers(false);

  //Used CLI, end early
  if (app.commandLine.hasSwitch('cli')) {
    await injectCLIApp();
  }

  await setupElectronWindowHandlers(false);

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === undefined) {
      createWindow();
    }
  });
}

setup();
