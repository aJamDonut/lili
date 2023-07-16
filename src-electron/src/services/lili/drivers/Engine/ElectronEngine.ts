import { getHistory, getHistoricWorkload } from 'app/src/services/lili';

import {
  type EventCallback,
  registerEvent,
  ElectronEventData,
  MixedEvent,
  callService,
} from '../../../event';

import { CompletionMessage, streamCompletion } from '../../../openai/ChatGPT';
import { WorkloadDefinition, getWorkloadDefinition, runWorkload } from '../../../aiworkload';
import { WorkloadOptions } from 'app/interfaces/Workload';
import { hasValidLicense } from '../../../shopify';

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

async function getWorkloads() {
  const workloads: Array<WorkloadDefinition> = [];

  const folders = (await callService('Storage:liliGetFolder', {
    folderName: `workloads`,
  })) as Array<string>;

  for (const folder of folders) {
    workloads.push(await getWorkloadDefinition(folder));
  }

  return workloads;
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

    //streamCompletion(messages, forEachToken, onComplete);

    runWorkload(
      options.prompt as string,
      {
        workload: options.workload,
        forEachToken: forEachToken,
        onComplete: onComplete,
      } as WorkloadOptions
    );
  });

  ipcWrap(justRegister, 'getWorkloads', async () => {
    return getWorkloads();
  });

  ipcWrap(justRegister, 'getHistory', async (_event: MixedEvent, options: ElectronEventData) => {
    return getHistory(options.start as number, options.end as number);
  });

  ipcWrap(justRegister, 'hasValidLicense', async (_event: MixedEvent, options: ElectronEventData) => {
    return hasValidLicense();
  });

  ipcWrap(justRegister, 'getHistoricWorkload', async (_event: MixedEvent, options: ElectronEventData) => {
    return getHistoricWorkload(options.id as number);
  });
}

//Sync function calls async but for our purpose events are registered just in
export function getElectronEngineHandlers() {
  setupElectronEngineHandlers(true);
  return functionList;
}
