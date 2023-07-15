import { BrowserWindow } from 'electron';
import { registerEvent, type EventCallback } from '../event';

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
  registerEvent(func(name), callback);
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
  ipcWrap(justRegister, 'minimize', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.minimize();
  });
}

export function getElectronWindowHandlers() {
  setupElectronWindowHandlers(false);
  return functionList;
}
