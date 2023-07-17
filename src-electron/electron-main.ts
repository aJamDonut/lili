import { app, BrowserWindow, nativeTheme } from 'electron';
import path from 'path';
import os from 'os';
import { setupElectronStorageHandlers } from './src/services/storage/ElectronStorage';
import { setupElectronEngineHandlers } from './src/services/lili/drivers/Engine/ElectronEngine';
import { registerEvent } from './src/services/event';
import { setupElectronWindowHandlers } from './src/services/window';
import { getLicense } from './src/services/shopify';

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
}

import { injectCLIApp } from './src/services/cli';

async function setup() {
  //Production?
  //setupElectronStorageHandlers(path.join(app.getPath('UserData')), 'Data');

  //Dev:
  await setupElectronStorageHandlers('UserData', 'Data');
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
