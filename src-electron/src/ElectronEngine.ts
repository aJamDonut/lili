import { type IpcMainEvent, ipcMain } from 'electron';

import { startWorkload } from '../../src/services/lili';

const functionList: Array<string> = [];
function func(name: string) {
  functionList.push('ElectronEngine:' + name);
  functionList.push('ElectronEngine:' + name + '-reply');
  functionList.push('ElectronEngine:' + name + '-complete');
  return 'ElectronEngine:' + name;
}

function ipcWrap(justRegister: boolean, name: string, callback: any) {
  if (justRegister) {
    func(name);
    return;
  }
  ipcMain.handle(func(name), (_event, args) => {
    callback(_event, args);
  });
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
}

export function getElectronEngineHandlers() {
  setupElectronEngineHandlers(true);
  return functionList;
}
