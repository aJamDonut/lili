/* Mostly just setup ignore this. */
import path from 'path';
import { promises as fs } from 'fs';
import { app } from 'electron';
import { EventCallback, MixedEvent, callService, registerEvent, registerInternalEvent } from '../../event';
import { default as fsextra } from 'fs-extra';

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

interface SetRoot {
  root: string;
}

let LILI_ROOT = '';
let ROOT = '';
let WORKSPACE: string | false = false;

export const changeWorkspace = async () => {
  const folderName = (await callService('FocusedWindow:chooseFolderDialog')) as string;
  console.log('Change workspace to', folderName);
  return setWorkspaceDir(false, { folderName });
};

export const getFolders = async () => {
  const folders = ['folder1', 'folder2'];
  return folders;
};
export const getWorkspaceDir = async () => {
  if (!WORKSPACE) {
    WORKSPACE = `${ROOT}${getSeperator()}workspaces${getSeperator()}default`;
  }
  return path.normalize(WORKSPACE);
};

export const setWorkspaceDir = async (_event: MixedEvent, { folderName }: ElectronStorageHandlerRequestFolder) => {
  WORKSPACE = folderName;
  return WORKSPACE;
};

export const setUserRoot = async (_event: MixedEvent, options: SetRoot) => {
  ROOT = options.root;
  return true;
};

export const getLiliRoot = async (_event: MixedEvent) => {
  return LILI_ROOT;
};

export const writeFile = async (_event: MixedEvent, { folderName, fileName, contents }: ElectronStorageHandlerRequestWrite) => {
  if (!fileName || typeof fileName !== 'string') {
    fileName = '';
  }

  //Check if filename was passed with subdirs (we'll create the subdirs)
  let split = fileName.split('\\');

  if (!split || !Array.isArray(split) || split.length === 1) {
    split = fileName.split('/');
  }

  if (Array.isArray(split) && split.length > 0) {
    fileName = split.pop() || '';

    const splitFolders = folderName.split(getSeperator());
    folderName = splitFolders.join(getSeperator()) + getSeperator() + split.join(getSeperator());
  }

  try {
    await fs.access(path.join(ROOT, folderName));
    console.log(path.join(ROOT, folderName) + ' Folder Exists ...');
  } catch (_error) {
    console.log('Make dir ' + path.join(ROOT, folderName));
    await fs.mkdir(path.join(ROOT, folderName), { recursive: true });
  }

  console.log(path.join(ROOT, folderName) + ' Write... ' + fileName);

  try {
    return await fs.writeFile(path.join(ROOT, folderName, fileName), contents);
  } catch (e) {
    console.log(e);
    return 'Failed';
  }
};

export const fileExists = async (_event: MixedEvent, { folderName, fileName }: ElectronStorageHandlerRequestFile) => {
  try {
    await fs.access(path.join(ROOT, folderName, fileName));
    return true;
  } catch (_error) {
    return false;
  }
};

export const folderExists = async (_event: MixedEvent, { folderName }: ElectronStorageHandlerRequestFolder) => {
  try {
    await fs.access(path.join(ROOT, folderName));
    return true;
  } catch (_error) {
    return false;
  }
};

export const readFile = async (_event: MixedEvent, { folderName, fileName }: ElectronStorageHandlerRequestFile) => {
  return await fs.readFile(path.join(ROOT, folderName, fileName), { encoding: 'utf8' });
};

export const readJson = async (_event: MixedEvent, { folderName, fileName }: ElectronStorageHandlerRequestFile) => {
  try {
    return JSON.parse(await fs.readFile(path.join(ROOT, folderName, fileName), { encoding: 'utf8' }));
  } catch (error) {
    console.error(error);
  }
};

//lili functions can access any folder
export const liliReadJson = async (_event: MixedEvent, { folderName, fileName }: ElectronStorageHandlerRequestFile) => {
  try {
    const contents: string = await fs.readFile(path.join(LILI_ROOT, folderName, fileName), {
      encoding: 'utf8',
    });
    return JSON.parse(contents);
  } catch (error) {
    console.error(error);
  }
};

export const liliReadFile = async (_event: MixedEvent, { folderName, fileName }: ElectronStorageHandlerRequestFile) => {
  return await fs.readFile(path.join(LILI_ROOT, folderName, fileName), { encoding: 'utf8' });
};

export const liliWriteFile = async (_event: MixedEvent, { folderName, fileName, contents }: ElectronStorageHandlerRequestWrite) => {
  try {
    await fs.access(path.join(LILI_ROOT, folderName));
  } catch (_error) {
    fs.mkdir(path.join(ROOT, folderName), { recursive: true });
  }
  return await fs.writeFile(path.join(LILI_ROOT, folderName, fileName), contents);
};

export function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear().toString().padStart(4, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
}
export const workspaceWriteFile = async (_event: MixedEvent, { fileName, contents }: ElectronStorageHandlerRequestWrite) => {
  const APPEND = '_' + getCurrentDateTime();
  const workspaceDir = (await getWorkspaceDir()) as string;
  const writeFile = path.join(workspaceDir, fileName);
  const copyFile = path.join(workspaceDir, fileName + APPEND);

  fsextra.ensureDir(path.dirname(writeFile));

  try {
    await fs.access(writeFile);
    await fs.copyFile(writeFile, copyFile);
  } catch (e) {}
  return await fs.writeFile(writeFile, contents);
};

export const workspaceReadFile = async (_event: MixedEvent, { fileName, contents }: ElectronStorageHandlerRequestWrite) => {
  return await fs.readFile(path.join((await getWorkspaceDir()) as string, fileName), { encoding: 'utf8' });
};

export const liliGetFolder = async (_event: MixedEvent, { folderName }: ElectronStorageHandlerRequestFolder) => {
  return await fs.readdir(path.join(LILI_ROOT, folderName));
};

export const getFolder = async (_event: MixedEvent, { folderName }: ElectronStorageHandlerRequestFolder) => {
  console.log('Get folder', ROOT, folderName);
  return await fs.readdir(path.join(ROOT, folderName));
};

export const deleteFile = async (_event: MixedEvent, { folderName, fileName }: ElectronStorageHandlerRequestFile) => {
  return await fs.unlink(path.join(ROOT, folderName, fileName));
};

export const deleteFolder = async (_event: MixedEvent, { folderName }: ElectronStorageHandlerRequestFolder) => {
  return await fs.rmdir(path.join(ROOT, folderName));
};
function getSeperator() {
  return '\\'; //Windows only
}
export const getExePath = () => {
  const seperator = getSeperator();
  const path = app.getAppPath();
  const parts = path.split(seperator);
  parts.pop(); //Remove last two parts they're incorrect.
  parts.pop();
  return parts.join(seperator);
};
import tree from 'tree-node-cli';

const TREE_OPS = {
  exclude: [/node_modules/],
  lineAscii: true,
  maxDepth: 5,
  dirsFirst: true,
  sizes: true,
};

export const getTree = async () => {
  return tree((await getWorkspaceDir()) as string, TREE_OPS);
};

export async function setupElectronStorageHandlers(rootDir: string | boolean, liliDataDir: string | boolean) {
  const justRegister = !rootDir ? true : false;

  ROOT = !rootDir ? 'UserData' : (rootDir as string);
  LILI_ROOT = !liliDataDir ? 'Data' : (liliDataDir as string);

  fsextra.ensureDir(`${ROOT}/workspaces/default`);
  fsextra.ensureDir(`${ROOT}/workload_history`);

  //set workspace to one from settings

  if (!justRegister) {
    try {
      await fs.access(ROOT);
    } catch (_error) {
      fs.mkdir(ROOT);
      fs.mkdir(ROOT + '/config');
    }

    try {
      await fs.access(ROOT + '/config');
    } catch (_error) {
      fs.mkdir(ROOT + '/config');
    }

    try {
      await fs.access(ROOT + '/primer');
    } catch (_error) {
      fs.mkdir(ROOT + '/primer');
    }

    try {
      await fs.access(ROOT + '/primer/user');
    } catch (_error) {
      fs.mkdir(ROOT + '/primer/user');
    }

    try {
      await fs.access(ROOT + '/primer/thirdparty');
    } catch (_error) {
      fs.mkdir(ROOT + '/primer/thirdparty');
    }
  }

  //Add functions to register internally and for client here (public functions)
  ipcWrap(justRegister, 'getFolders', getFolders);

  ipcWrap(justRegister, 'getFolder', getFolder);

  ipcWrap(justRegister, 'readFile', readFile);
  ipcWrap(justRegister, 'writeFile', writeFile);

  ipcWrap(justRegister, 'changeWorkspace', changeWorkspace);
  ipcWrap(justRegister, 'workspaceReadFile', workspaceReadFile);
  ipcWrap(justRegister, 'workspaceWriteFile', workspaceWriteFile);
  ipcWrap(justRegister, 'getWorkspaceDir', getWorkspaceDir);

  ipcWrap(justRegister, 'fileExists', fileExists);

  ipcWrap(justRegister, 'folderExists', folderExists);

  ipcWrap(justRegister, 'readJson', readJson);

  ipcWrap(justRegister, 'deleteFile', deleteFile);

  ipcWrap(justRegister, 'getTree', getTree);

  ipcWrap(justRegister, 'deleteFolder', deleteFolder);

  ipcWrap(justRegister, 'setUserRoot', setUserRoot);
  ipcWrap(justRegister, 'getLiliRoot', getLiliRoot);

  //Add function to register just internally (private functions)
  registerInternalEvent(serviceName('liliReadJson'), liliReadJson);
  registerInternalEvent(serviceName('liliWriteFile'), liliWriteFile);
  registerInternalEvent(serviceName('liliReadFile'), liliReadFile);
  registerInternalEvent(serviceName('liliGetFolder'), liliGetFolder);
}

//Sync function calls async but for our purpose events are registered just in time
export function getElectronStorageHandlers() {
  setupElectronStorageHandlers(false, false);
  return functionList;
}
