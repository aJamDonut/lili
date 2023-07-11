import type {
  StorageDriverInterface,
  StorageFolder,
} from '../../interfaces/Storage';

import { run } from 'src/services/electron';

export class ElectronStorage implements StorageDriverInterface {
  async getFolders(): Promise<StorageFolder[]> {
    return run('ElectronStorage:getFolders');
  }

  async getFolder(folderName: string): Promise<string[]> {
    return run('ElectronStorage:getFolder', { folderName });
  }
  async writeFile(
    folderName: string,
    fileName: string,
    contents: string
  ): Promise<boolean> {
    console.log('Try write', fileName);
    return run('ElectronStorage:writeFile', { folderName, fileName, contents });
  }
  async readFile(folderName: string, fileName: string): Promise<string> {
    return run('ElectronStorage:readFile', { folderName, fileName });
  }
  async readJson(folderName: string, fileName: string): Promise<object> {
    return run('ElectronStorage:readJson', { folderName, fileName });
  }
  async deleteFile(folderName: string, fileName: string): Promise<object> {
    return run('ElectronStorage:deleteFile', { folderName, fileName });
  }

  async fileExists(folderName: string, fileName: string): Promise<object> {
    return run('ElectronStorage:fileExists', { folderName, fileName });
  }
  async folderExists(folderName: string): Promise<object> {
    return run('ElectronStorage:folderExists', { folderName });
  }
  async deleteFolder(folderName: string): Promise<object> {
    return run('ElectronStorage:deleteFolder', { folderName });
  }
}
