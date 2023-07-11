/* Mostly just setup ignore this. */
import { ipcMain } from 'electron';
import path from 'path';
import { promises as fs } from 'fs';

const functionList: Array<string> = [];
function func(name: string) {
  functionList.push('ElectronStorage:' + name);
  return 'ElectronStorage:' + name;
}

function ipcWrap(name: string, callback: any) {
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

export function setupElectronStorageHandlers(ROOT: string) {
  console.log('Setup with root', ROOT);
  //Add new functions here
  ipcWrap('getFolders', async () => {
    const folders = ['folder1', 'folder2'];
    return folders;
  });

  ipcWrap(
    'getFolder',
    async ({ folderName }: ElectronStorageHandlerRequestFolder) => {
      return await fs.readdir(folderName);
    }
  );

  ipcWrap(
    'writeFile',
    async ({
      folderName,
      fileName,
      contents,
    }: ElectronStorageHandlerRequestWrite) => {
      console.log('Write to', folderName, fileName, contents);
      return await fs.writeFile(
        path.join(ROOT, folderName, fileName),
        contents
      );
    }
  );

  ipcWrap(
    'readFile',
    async ({ folderName, fileName }: ElectronStorageHandlerRequestFile) => {
      return await fs.readFile(path.join(ROOT, folderName, fileName));
    }
  );

  ipcWrap(
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
    'deleteFile',
    async ({ folderName, fileName }: ElectronStorageHandlerRequestFile) => {
      return await fs.unlink(path.join(ROOT, folderName, fileName));
    }
  );
}

export function getElectronStorageHandlers() {
  setupElectronStorageHandlers('');
  return functionList;
}
