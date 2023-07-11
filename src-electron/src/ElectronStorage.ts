/* Mostly just setup ignore this. */
import { ipcMain } from 'electron';
import path from 'path';
import { promises as fs } from 'fs';

const functionList: Array<string> = [];
function func(name: string) {
  functionList.push('ElectronStorage:' + name);
  return 'ElectronStorage:' + name;
}

function ipcWrap(justRegister: boolean, name: string, callback: any) {
  if (justRegister) {
    func(name);
    return;
  }
  ipcMain.handle(func(name), (_event, args) => {
    callback(args);
  });
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

export async function setupElectronStorageHandlers(rootDir: string | boolean) {
  const ROOT = !rootDir ? '' : (rootDir as string);

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
  ipcWrap(justRegister, 'getFolders', async () => {
    const folders = ['folder1', 'folder2'];
    return folders;
  });

  ipcWrap(
    justRegister,
    'getFolder',
    async ({ folderName }: ElectronStorageHandlerRequestFolder) => {
      return await fs.readdir(folderName);
    }
  );

  ipcWrap(
    justRegister,
    'writeFile',
    async ({
      folderName,
      fileName,
      contents,
    }: ElectronStorageHandlerRequestWrite) => {
      try {
        await fs.access(path.join(ROOT, folderName));
      } catch (_error) {
        console.log('Making dir: ' + path.join(ROOT, folderName));
        fs.mkdir(path.join(ROOT, folderName));
      }
      return await fs.writeFile(
        path.join(ROOT, folderName, fileName),
        contents
      );
    }
  );

  ipcWrap(
    justRegister,
    'fileExists',
    async ({ folderName, fileName }: ElectronStorageHandlerRequestFile) => {
      try {
        await fs.access(path.join(ROOT, folderName, fileName));
        return true;
      } catch (_error) {
        return false;
      }
    }
  );

  ipcWrap(
    justRegister,
    'folderExists',
    async ({ folderName }: ElectronStorageHandlerRequestFolder) => {
      try {
        await fs.access(path.join(ROOT, folderName));
        return true;
      } catch (_error) {
        return false;
      }
    }
  );

  ipcWrap(
    justRegister,
    'readFile',
    async ({ folderName, fileName }: ElectronStorageHandlerRequestFile) => {
      return await fs.readFile(path.join(ROOT, folderName, fileName));
    }
  );

  ipcWrap(
    justRegister,
    'readJson',
    async ({ folderName, fileName }: ElectronStorageHandlerRequestFile) => {
      try {
        return JSON.stringify(
          await fs.readFile(path.join(ROOT, folderName, fileName))
        );
      } catch (error) {
        console.error(error);
      }
    }
  );

  ipcWrap(
    justRegister,
    'deleteFile',
    async ({ folderName, fileName }: ElectronStorageHandlerRequestFile) => {
      return await fs.unlink(path.join(ROOT, folderName, fileName));
    }
  );

  ipcWrap(
    justRegister,
    'deleteFolder',
    async ({ folderName }: ElectronStorageHandlerRequestFolder) => {
      return await fs.unlink(path.join(ROOT, folderName));
    }
  );
}

export function getElectronStorageHandlers() {
  setupElectronStorageHandlers(false);
  return functionList;
}
