import type {
  StorageDriverInterface,
  StorageFolder,
} from 'app/interfaces/Storage';

import { run } from 'src/services/electron';

export class ElectronStorage implements StorageDriverInterface {
  async getFolders(): Promise<StorageFolder[]> {
    return run('Storage:getFolders');
  }

  async getFolder(folderName: string): Promise<string[]> {
    return run('Storage:getFolder', { folderName });
  }
  async writeFile(
    folderName: string,
    fileName: string,
    contents: string
  ): Promise<boolean> {
    console.log('Try write', fileName);
    return run('Storage:writeFile', { folderName, fileName, contents });
  }
  async readFile(folderName: string, fileName: string): Promise<string> {
    return run('Storage:readFile', { folderName, fileName });
  }
  async readJson(folderName: string, fileName: string): Promise<object> {
    return run('Storage:readJson', { folderName, fileName });
  }
  async deleteFile(folderName: string, fileName: string): Promise<object> {
    return run('Storage:deleteFile', { folderName, fileName });
  }

  async fileExists(folderName: string, fileName: string): Promise<object> {
    return run('Storage:fileExists', { folderName, fileName });
  }
  async folderExists(folderName: string): Promise<object> {
    return run('Storage:folderExists', { folderName });
  }
  async deleteFolder(folderName: string): Promise<object> {
    return run('Storage:deleteFolder', { folderName });
  }
}
