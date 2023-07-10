import { ipcMain } from 'electron';

const functionList: Array<string> = [];

function func(name: string) {
  functionList.push('ElectronStorage:' + name);
  return 'ElectronStorage:' + name;
}

function ipcWrap(name: string, callback: any) {
  ipcMain.handle(func(name), callback);
}

export function setupElectronStorageHandlers() {
  ipcWrap('getFolders', async () => {
    const folders = ['folder1', 'folder2'];
    return folders;
  });
}

export function getElectronStorageHandlers() {
  return functionList;
}
