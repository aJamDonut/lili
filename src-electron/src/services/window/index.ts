import { BrowserWindow, ipcRenderer } from 'electron';
import { registerEvent, type EventCallback, MixedEvent } from '../event';

const functionList: Array<string> = [];

let SERVICE_KEY = 'FocusedWindow';

export function setServiceKey(key: string) {
  SERVICE_KEY = key;
}

function serviceName(name: string) {
  return SERVICE_KEY + ':' + name;
}

function func(name: string) {
  name = serviceName(name);
  if (functionList.includes(name)) {
    return name;
  }
  functionList.push(name);
  functionList.push(name + '-reply');
  functionList.push(name + '-complete');
  return name;
}

function ipcWrap(justRegister: boolean, name: string, callback: EventCallback) {
  if (justRegister) {
    func(name);
    return;
  }
  registerEvent(func(name), (_event, ...args) => {
    callback(_event, ...args);
    _event.sender.send(func(name), {});
  });
}

interface WindowData {
  name: string;
}

export async function setupElectronWindowHandlers(justRegister: boolean) {
  ipcWrap(justRegister, 'close', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.close();
  });
  ipcWrap(justRegister, 'maximize', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.maximize();
  });
  ipcWrap(justRegister, 'unmaximize', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.unmaximize();
  });

  ipcWrap(justRegister, 'listen', (_event: MixedEvent, options) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      const oldEmitter = focusedWindow.emit;
      focusedWindow.emit = function (eventName: string, ...args: any[]) {
        try {
          if (focusedWindow) focusedWindow.webContents.send(`Window:${options.name}:${eventName}`);
        } catch (e) {
          console.log('Window is possible destroyed now');
        }
        return oldEmitter.call(focusedWindow, eventName, ...args);
      };
    }
  });

  ipcWrap(justRegister, 'minimize', (_event: MixedEvent) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.minimize();
  });
  ipcWrap(justRegister, 'isMaximized', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.isMaximized();
  });
}

export function getElectronWindowHandlers() {
  setupElectronWindowHandlers(true);
  return functionList;
}
