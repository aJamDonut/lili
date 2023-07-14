/* Mostly just setup ignore this. */
import path from 'path';
import { promises as fs } from 'fs';
import { EventCallback, MixedEvent, registerEvent, registerInternalEvent } from '../../event';

const functionList: Array<string> = [];

const SERVICE_KEY = 'Storage';

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

let LILI_ROOT = '';
let ROOT = '';

export const getFolders = async () => {
  const folders = ['folder1', 'folder2'];
  return folders;
};

export const getFolder = async (_event: MixedEvent, { folderName }: ElectronStorageHandlerRequestFolder) => {
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
  return await fs.readFile(path.join(ROOT, folderName, fileName), { encoding: 'utf8' });
};

export const readJson = async (
  _event: MixedEvent,
  { folderName, fileName }: ElectronStorageHandlerRequestFile
) => {
  try {
    return JSON.parse(await fs.readFile(path.join(ROOT, folderName, fileName), { encoding: 'utf8' }));
  } catch (error) {
    console.error(error);
  }
};

//lili functions can access any folder
export const liliReadJson = async (
  _event: MixedEvent,
  { folderName, fileName }: ElectronStorageHandlerRequestFile
) => {
  try {
    console.log('Read', path.join(LILI_ROOT, folderName, fileName));
    const contents: string = await fs.readFile(path.join(LILI_ROOT, folderName, fileName), {
      encoding: 'utf8',
    });
    return JSON.parse(contents);
  } catch (error) {
    console.error(error);
  }
};

export const liliReadFile = async (
  _event: MixedEvent,
  { folderName, fileName }: ElectronStorageHandlerRequestFile
) => {
  return await fs.readFile(path.join(LILI_ROOT, folderName, fileName), { encoding: 'utf8' });
};

export const liliWriteFile = async (
  _event: MixedEvent,
  { folderName, fileName, contents }: ElectronStorageHandlerRequestWrite
) => {
  console.log('Wants to write file', LILI_ROOT, folderName);
  try {
    await fs.access(path.join(LILI_ROOT, folderName));
  } catch (_error) {
    console.log('Making dir: ' + path.join(LILI_ROOT, folderName));
    fs.mkdir(path.join(LILI_ROOT, folderName));
  }
  console.log('Will write file: ' + path.join(LILI_ROOT, folderName, fileName));
  return await fs.writeFile(path.join(LILI_ROOT, folderName, fileName), contents);
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

export async function setupElectronStorageHandlers(rootDir: string | boolean, liliDataDir: string | boolean) {
  const justRegister = !rootDir ? true : false;

  ROOT = !rootDir ? 'UserData' : (rootDir as string);
  LILI_ROOT = !liliDataDir ? 'Data' : (liliDataDir as string);

  console.log('Setup with root', ROOT);
  console.log('Setup with lili data', LILI_ROOT);

  if (!justRegister) {
    try {
      await fs.access(ROOT);
    } catch (_error) {
      console.log('Making dir: ' + ROOT);
      fs.mkdir(ROOT);
      console.log('Making dir: ' + ROOT + '/config');
      fs.mkdir(ROOT + '/config');
    }

    try {
      await fs.access(ROOT + '/config');
    } catch (_error) {
      console.log('Making dir: ' + ROOT + '/config');
      fs.mkdir(ROOT + '/config');
    }
  }

  console.log('Setup wraps', justRegister);

  //Add functions to register internally and for client here (public functions)
  ipcWrap(justRegister, 'getFolders', getFolders);

  ipcWrap(justRegister, 'getFolder', getFolder);

  ipcWrap(justRegister, 'writeFile', writeFile);

  ipcWrap(justRegister, 'fileExists', fileExists);

  ipcWrap(justRegister, 'folderExists', folderExists);

  ipcWrap(justRegister, 'readFile', readFile);

  ipcWrap(justRegister, 'readJson', readJson);

  ipcWrap(justRegister, 'deleteFile', deleteFile);

  ipcWrap(justRegister, 'deleteFolder', deleteFolder);

  //Add function to register just internally (private functions)
  registerInternalEvent(serviceName('liliReadJson'), liliReadJson);
  registerInternalEvent(serviceName('liliWriteFile'), liliWriteFile);
  registerInternalEvent(serviceName('liliReadFile'), liliReadFile);
}

export async function getElectronStorageHandlers() {
  await setupElectronStorageHandlers(false, false);
  return functionList;
}
