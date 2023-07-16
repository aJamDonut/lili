import { EngineDriverInterface } from 'app/interfaces/Engine';
import { HistoryEntry, WorkloadHistory, WorkloadOptions } from 'app/interfaces/Workload';

import { run, on, off } from 'src/services/electron';

export interface LiliJsonResponse {
  type: 'inline' | 'advanced';
  state: 'success' | 'failed' | 'warning' | 'smiley' | 'unhappy';
  content: string;
  component?: string;
}

export class ElectronEngine implements EngineDriverInterface {
  name = 'Electron';

  startWorkload(options: WorkloadOptions): void {
    const forEachToken = (_event: any, token: string) => {
      if (typeof options.onJsonResponse === 'function' && token.length > 10) {
        //It's long enough to potentially be a json update. lets parse it
        try {
          options.onJsonResponse(JSON.parse(token) as LiliJsonResponse);
          return;
        } catch (e) {
          console.log('Not a normal JSON response');
        }
      }
      if (typeof options.forEachToken === 'function') {
        options.forEachToken(token);
      }
    };

    on('Engine:startWorkload-reply', forEachToken);

    const onComplete = (_event: any, tokens: string) => {
      if (typeof options.onComplete === 'function') {
        options.onComplete(tokens);
      }
    };

    on('Engine:startWorkload-complete', onComplete);

    const clearer = {
      forEachToken: null,
      onComplete: null,
      onJsonResponse: null,
    };

    run('Engine:startWorkload', { ...options, ...clearer });
  }

  async getWorkloads() {
    return await run('Engine:getWorkloads');
  }

  async getHistory(start: number, end: number): Promise<Array<HistoryEntry>> {
    return await run('Engine:getHistory', { start, end });
  }

  async getHistoricWorkload(id: number): Promise<WorkloadHistory> {
    return await run('Engine:getHistoricWorkload', { id });
  }

  async hasValidLicense(): Promise<boolean> {
    return await run('Engine:hasValidLicense');
  }

  async unsetLicense(): Promise<boolean> {
    return await run('Engine:unsetLicense');
  }
}
