import {
  StorageDriverInterface,
  StorageFolder,
} from '../../interfaces/Storage';

export class ElectronStorage implements StorageDriverInterface {
  async getFolders(): Promise<StorageFolder[]> {
    throw new Error('Method not implemented.');
  }
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
}
