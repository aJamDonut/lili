import { EngineDriverInterface } from '../../interfaces/Engine';
import { StorageDriverInterface } from '../../interfaces/Storage';
import {
  HistoryEntry,
  WorkloadHistory,
  WorkloadOptions,
} from '../../interfaces/Workload';
import { ElectronStorage } from '../Storage/ElectronStorage';
import { run, on } from 'src/services/electron';

export class ElectronEngine implements EngineDriverInterface {
  name = 'Electron';

  private _storageEngine: StorageDriverInterface;

  constructor(storageEngine: StorageDriverInterface = new ElectronStorage()) {
    this._storageEngine = storageEngine;
  }

  startWorkload(options: WorkloadOptions): void {
    const forEachToken = (_event: any, token: string) => {
      options.forEachToken(token);
    };

    on('ElectronEngine:startWorkload-reply', forEachToken);

    const onComplete = (_event: any, tokens: string) => {
      options.onComplete(tokens);
    };

    on('ElectronEngine:startWorkload-complete', onComplete);
    const clearer = {
      forEachToken: null,
      onComplete: null,
    };
    run('ElectronEngine:startWorkload', { ...options, ...clearer });
  }

  async getHistory(start: number, end: number): Promise<Array<HistoryEntry>> {
    return await run('ElectronEngine:getHistory', { start, end });
  }

  async getHistoricWorkload(id: number): Promise<WorkloadHistory> {
    return await run('ElectronEngine:getHistoricWorkload', { id });
  }
}
