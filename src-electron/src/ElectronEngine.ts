import { type IpcMainEvent, ipcMain } from 'electron';

import {
  startWorkload,
  getHistory,
  getHistoricWorkload,
} from '../../src/services/lili';

const functionList: Array<string> = [];

const SERVICE_KEY = 'ElectronEngine';

function func(name: string) {
  name = SERVICE_KEY + ':' + name;
  if (functionList.includes(name)) {
    return name;
  }
  functionList.push(name);
  functionList.push(name + '-reply');
  functionList.push(name + '-complete');
  return name;
}

function ipcWrap(justRegister: boolean, name: string, callback: any) {
  if (justRegister) {
    func(name);
    return;
  }
  ipcMain.handle(func(name), async (_event, args) => {
    return callback(_event, args);
  });
}

interface HistoryOptionsInterface {
  start: number;
  end: number;
}

/* Setup is done... meat here. */

export async function setupElectronEngineHandlers(justRegister: boolean) {
  //Add new functions here
  ipcWrap(
    justRegister,
    'startWorkload',
    async (_event: IpcMainEvent, options: object) => {
      //Init AI, send the callback function
      //For every token
      const forEachToken = (token: string) => {
        _event.sender.send(func('startWorkload-reply'), token);
      };
      //... when its finaly doone
      const onComplete = (allTokens: string) => {
        _event.sender.send(func('startWorkload-complete'), allTokens);
      };

      startWorkload({ ...options, forEachToken, onComplete });
    }
  );
  ipcWrap(
    justRegister,
    'getHistory',
    async (_event: IpcMainEvent, { start, end }: HistoryOptionsInterface) => {
      return getHistory(start, end);
    }
  );

  ipcWrap(
    justRegister,
    'getHistoricWorkload',
    async (_event: IpcMainEvent, { id }: any) => {
      return getHistoricWorkload(id);
    }
  );
}

export function getElectronEngineHandlers() {
  setupElectronEngineHandlers(true);
  return functionList;
}
