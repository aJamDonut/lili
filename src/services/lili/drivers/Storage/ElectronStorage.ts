import type {
  StorageDriverInterface,
  StorageFolder,
} from '../../interfaces/Storage';

import { ipcWrapper } from '../MessageBus/ElectronMessageBus';

export class ElectronStorage implements StorageDriverInterface {
  async getFolders(): Promise<StorageFolder[]> {
    return (await ipcWrapper('ElectronStorage:getFolders', false)) as Promise<
      StorageFolder[]
    >;
  }
  /*
  async getFolder(folderName: string): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  async writeFile(
    folderName: string,
    fileName: string,
    contents: string
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async readFile(folderName: string, fileName: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async readJson(folderName: string, fileName: string): Promise<Object> {
    throw new Error('Method not implemented.');
  }
  async deleteFile(folderName: string, fileName: string): Promise<Object> {
    throw new Error('Method not implemented.');
  }
  */
}
