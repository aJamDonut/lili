import { EngineDriverInterface, RecallHistoryOptions } from 'app/interfaces/Engine';
import { HistoricWorkload, HistoryFile } from 'app/interfaces/Lili';
import { HistoryEntry, WorkloadHistory, WorkloadOptions } from 'app/interfaces/Workload';

import { ValidLicenseResponse } from 'app/src-electron/src/services/shopify';

import { run, on } from 'src/services/electron';

export interface LiliJsonResponse {
  type: 'inline' | 'advanced';
  state: 'success' | 'failed' | 'warning' | 'smiley' | 'unhappy';
  content: string;
  component?: string;
}

function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear().toString().padStart(4, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
}

let lastId = 'none';
export class ElectronEngine implements EngineDriverInterface {
  name = 'Electron';

  reset() {
    lastId = 'none';
  }

  /**
   *
   * @param options
   * @returns string, The id of the workload
   */
  async recallWorkload(options: RecallHistoryOptions): Promise<string> {
    console.log('RUN', options);
    if (!options.workloadHistory.definition.meta.id) {
      throw 'No definition meta id options';
    }

    let userHasPrompted = false;

    for (const message of options.workloadHistory.history) {
      console.log('Message', message);
      const token = message.content || '';

      if (message.role === 'system') {
        continue;
      }

      if (message.role === 'user' && !message.workloadOptions) {
        //Hidden from user usually
        continue;
      }

      if (message.role === 'user' && message.workloadOptions) {
        userHasPrompted = true; //Allow tokens to flow
        if (userHasPrompted && typeof options.onComplete === 'function') await options.onComplete(token);
        await options.forEachUserPrompt(message.workloadOptions);
        continue;
      }

      if (message.role === 'lili') {
        if (typeof options.onJsonResponse !== 'function') {
          continue; //Can never process if this function isnt available
        }
        //It's long enough to potentially be a json update. lets parse it
        try {
          await options.onJsonResponse(JSON.parse(token) as LiliJsonResponse);
          continue;
        } catch (e) {
          console.log('Not a normal JSON response');
        }
        continue;
      }
      console.log('SEND TOKEN', token);
      if (userHasPrompted && typeof options.forEachToken === 'function') await options.forEachToken(token);
    }

    return options.workloadHistory.definition.meta.id;
  }

  /**
   *
   * @param options
   * @returns string, The id of the workload
   */
  startWorkload(options: WorkloadOptions): string {
    if (!options.id && lastId === 'none') {
      options.id = getCurrentDateTime();
      lastId = options.id;
    }
    if (!options.id && lastId !== 'none') {
      options.id = lastId;
    }
    const forEachToken = async (token: string) => {
      if (typeof options.onJsonResponse === 'function' && token.length > 20) {
        //It's long enough to potentially be a json update. lets parse it
        try {
          await options.onJsonResponse(JSON.parse(token) as LiliJsonResponse);
          return;
        } catch (e) {
          console.log('Not a normal JSON response');
        }
      }
      if (typeof options.forEachToken === 'function') {
        await options.forEachToken(token);
      }
    };

    on('Engine:startWorkload-reply', forEachToken);

    const onComplete = async (tokens: string) => {
      if (typeof options.onComplete === 'function') {
        await options.onComplete(tokens);
      }
    };

    on('Engine:startWorkload-complete', onComplete);

    const clearer = {
      forEachToken: null,
      onComplete: null,
      onJsonResponse: null,
    };

    run('Engine:startWorkload', { ...options, ...clearer });

    return options.id;
  }

  async getWorkloads() {
    return await run('Engine:getWorkloads');
  }

  async getHistory(start: number, end: number): Promise<Array<HistoryFile>> {
    return await run('Engine:getHistory', { start, end });
  }

  async purgeHistory(): Promise<void> {
    return await run('Engine:purgeHistory');
  }

  async getHistoricWorkload(id: string): Promise<WorkloadHistory> {
    return await run('Engine:getHistoricWorkload', { id });
  }

  async hasValidLicense(): Promise<boolean> {
    return await run('Engine:hasValidLicense');
  }

  async unsetLicense(): Promise<boolean> {
    return await run('Engine:unsetLicense');
  }
  async getLicense(key: string): Promise<ValidLicenseResponse> {
    return await run('Engine:getLicense', { key });
  }
}
