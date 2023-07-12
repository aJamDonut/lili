/* Mostly just setup ignore this. */
import path from 'path';
import { promises as fs } from 'fs';
import { EventCallback, MixedEvent, registerEvent } from '../../event';

const functionList: Array<string> = [];

const SERVICE_KEY = 'Storage';

function func(name: string) {
  name = SERVICE_KEY + ':' + name;
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

/* Setup is done... meat here. */

//Share across folder operations, e.g. create, delete
interface ElectronStorageHandlerRequestFolder {
  folderName: string;
}

//Shared across file operations, e.g. create, delete
interface ElectronStorageHandlerRequestFile {
  folderName: string;
  fileName: string;
}

//Used in write functions, e.g. write, update (overwrite)
interface ElectronStorageHandlerRequestWrite {
  folderName: string;
  fileName: string;
  contents: string;
}

let ROOT = '';

export const getFolders = async () => {
  const folders = ['folder1', 'folder2'];
  return folders;
};

export const getFolder = async (
  _event: MixedEvent,
  { folderName }: ElectronStorageHandlerRequestFolder
) => {
  return await fs.readdir(folderName);
};

export const writeFile = async (
  _event: MixedEvent,
  { folderName, fileName, contents }: ElectronStorageHandlerRequestWrite
) => {
  console.log('Wants to write file', ROOT, folderName);
  try {
    await fs.access(path.join(ROOT, folderName));
  } catch (_error) {
    console.log('Making dir: ' + path.join(ROOT, folderName));
    fs.mkdir(path.join(ROOT, folderName));
  }
  console.log('Will write file: ' + path.join(ROOT, folderName, fileName));
  return await fs.writeFile(path.join(ROOT, folderName, fileName), contents);
};

export const fileExists = async (
  _event: MixedEvent,
  { folderName, fileName }: ElectronStorageHandlerRequestFile
) => {
  try {
    await fs.access(path.join(ROOT, folderName, fileName));
    return true;
  } catch (_error) {
    return false;
  }
};

export const folderExists = async (
  _event: MixedEvent,
  { folderName }: ElectronStorageHandlerRequestFolder
) => {
  try {
    await fs.access(path.join(ROOT, folderName));
    return true;
  } catch (_error) {
    return false;
  }
};

export const readFile = async (
  _event: MixedEvent,
  { folderName, fileName }: ElectronStorageHandlerRequestFile
) => {
  return await fs.readFile(path.join(ROOT, folderName, fileName));
};

export const readJson = async (
  _event: MixedEvent,
  { folderName, fileName }: ElectronStorageHandlerRequestFile
) => {
  try {
    return JSON.stringify(
      await fs.readFile(path.join(ROOT, folderName, fileName))
    );
  } catch (error) {
    console.error(error);
  }
};

export const deleteFile = async (
  _event: MixedEvent,
  { folderName, fileName }: ElectronStorageHandlerRequestFile
) => {
  return await fs.unlink(path.join(ROOT, folderName, fileName));
};

export const deleteFolder = async (
  _event: MixedEvent,
  { folderName }: ElectronStorageHandlerRequestFolder
) => {
  return await fs.unlink(path.join(ROOT, folderName));
};

export async function setupElectronStorageHandlers(rootDir: string | boolean) {
  ROOT = !rootDir ? '' : (rootDir as string);

  const justRegister = !ROOT ? true : false;

  console.log('Setup with root', ROOT);

  if (!justRegister) {
    try {
      await fs.access(ROOT);
    } catch (_error) {
      console.log('Making dir: ' + ROOT);
      fs.mkdir(ROOT);
    }
  }

  //Add new functions here
  ipcWrap(justRegister, 'getFolders', getFolders);

  ipcWrap(justRegister, 'getFolder', getFolder);

  ipcWrap(justRegister, 'writeFile', writeFile);

  ipcWrap(justRegister, 'fileExists', fileExists);

  ipcWrap(justRegister, 'folderExists', folderExists);

  ipcWrap(justRegister, 'readFile', readFile);

  ipcWrap(justRegister, 'readJson', readJson);

  ipcWrap(justRegister, 'deleteFile', deleteFile);

  ipcWrap(justRegister, 'deleteFolder', deleteFolder);
}

export function getElectronStorageHandlers() {
  setupElectronStorageHandlers(false);
  return functionList;
}
