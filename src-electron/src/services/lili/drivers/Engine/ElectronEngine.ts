import { getHistory, getHistoricWorkload } from 'app/src/services/lili';

import { type EventCallback, registerEvent, ElectronEventData, MixedEvent } from '../../../event';

import { CompletionMessage, streamCompletion } from '../../../openai/ChatGPT';

const functionList: Array<string> = [];

const SERVICE_KEY = 'Engine';

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

function ipcWrap(justRegister: boolean, name: string, callback: EventCallback) {
  if (justRegister) {
    func(name);
    return;
  }
  registerEvent(func(name), callback);
}

/* Setup is done... meat here. */

export async function setupElectronEngineHandlers(justRegister: boolean) {
  //Add new functions here
  ipcWrap(justRegister, 'startWorkload', async (_event: MixedEvent, options: ElectronEventData) => {
    //Init AI, send the callback function
    //For every token
    const forEachToken = (token: string) => {
      _event.sender.send(func('startWorkload-reply'), token);
    };
    //... when its finaly doone
    const onComplete = (allTokens: string) => {
      _event.sender.send(func('startWorkload-complete'), allTokens);
    };

    const messages: Array<CompletionMessage> = [
      {
        role: 'user',
        content: options.prompt as string,
      },
    ];

    streamCompletion(messages, forEachToken, onComplete);
  });

  ipcWrap(justRegister, 'testIPC', async () => {
    //console.log()
    /*
    console.log('Ill atleast try and write the file');
    const ret = callService('Storage:writeFile', {
      folderName: 'trst',
      fileName: 'testo.txt',
      contents: 'testuruuu',
    });
    console.log('Ret', ret);
    return 'Ran';
    */
  });

  ipcWrap(justRegister, 'getHistory', async (_event: MixedEvent, options: ElectronEventData) => {
    return getHistory(options.start as number, options.end as number);
  });

  ipcWrap(justRegister, 'getHistoricWorkload', async (_event: MixedEvent, options: ElectronEventData) => {
    return getHistoricWorkload(options.id as number);
  });
}

export function getElectronEngineHandlers() {
  setupElectronEngineHandlers(true);
  return functionList;
}