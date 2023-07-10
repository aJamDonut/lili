import { EngineDriverInterface } from '../../interfaces/Engine';
import { StorageDriverInterface } from '../../interfaces/Storage';
import { HistoryEntry, WorkloadOptions } from '../../interfaces/Workload';
import { ElectronStorage } from '../Storage/ElectronStorage';

export class ElectronEngine implements EngineDriverInterface {
  name = 'Electron';

  private _storageEngine: StorageDriverInterface;

  constructor(storageEngine: StorageDriverInterface = new ElectronStorage()) {
    this._storageEngine = storageEngine;
  }

  run(options: WorkloadOptions) {}

  async getHistory(start: number, end: number): Promise<Array<HistoryEntry>> {
    let historyFiles = this._storageEngine.getFolder('history');
    let historyList: Array<HistoryEntry> = [];
    historyFiles.forEach(async (file) => {
      historyList.push(
        (await this._storageEngine.readJson('history', file)) as HistoryEntry
      );
    });
    return historyList;
  }
}
