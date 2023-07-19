import { type EventCallback, registerEvent, ElectronEventData, MixedEvent, callService } from '../../../event';

import { getWorkloadDefinition, runWorkload } from '../../../aiworkload';
import { WorkloadOptions } from 'app/interfaces/Workload';
import { hasValidLicense, unsetLicense, getLicense } from '../../../shopify';
import { HistoricWorkload, HistoryFile, HistoryMetaData, MessageHistory, WorkloadDefinition } from 'app/interfaces/Lili';

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

    //streamCompletion(messages, forEachToken, onComplete);

    runWorkload(
      options.prompt as string,
      {
        ...options,
        forEachToken: forEachToken,
        onComplete: onComplete,
      } as WorkloadOptions
    );
  });

  ipcWrap(justRegister, 'getWorkloads', async () => {
    return getWorkloads();
  });

  ipcWrap(justRegister, 'getHistory', async (_event: MixedEvent, options: ElectronEventData) => {
    let historyIds = (await callService('Storage:getFolder', {
      folderName: `workload_history`,
    })) as Array<string>;

    const historyList = [];
    options.start = parseInt(options.start as string);
    options.end = parseInt(options.end as string);
    const start = options.start || 0;
    const end = options.end || 10;
    let i = 0;

    for (const id of historyIds) {
      if (i > start && i < end) {
        continue;
      }
      const definition = (await callService('Storage:readJson', {
        folderName: `workload_history/${id}/`,
        fileName: 'definition.json',
      })) as HistoryFile;
      if (definition && definition.meta) {
        historyList.push(definition);
      }
    }
    return historyList;
  });

  ipcWrap(justRegister, 'hasValidLicense', async (_event: MixedEvent, options: ElectronEventData) => {
    return hasValidLicense();
  });

  ipcWrap(justRegister, 'unsetLicense', async (_event: MixedEvent, options: ElectronEventData) => {
    return unsetLicense();
  });

  ipcWrap(justRegister, 'getLicense', async (_event: MixedEvent, options: ElectronEventData) => {
    return getLicense(options.key as string, true);
  });

  ipcWrap(justRegister, 'purgeHistory', async (_event: MixedEvent) => {
    return await callService('Storage:deleteFolder', {
      folderName: `workload_history`,
    });
  });

  ipcWrap(justRegister, 'deleteHistoricWorkload', async (_event: MixedEvent, options: ElectronEventData): Promise<boolean> => {
    const id = options.id;

    await callService('Storage:deleteFile', {
      folderName: `workload_history/${id}/`,
      fileName: 'definition.json',
    });

    await callService('Storage:deleteFile', {
      folderName: `workload_history/${id}/`,
      fileName: 'history.json',
    });

    await callService('Storage:deleteFolder', {
      folderName: `workload_history/${id}/`,
    });

    return true;
  });

  ipcWrap(justRegister, 'getHistoricWorkload', async (_event: MixedEvent, options: ElectronEventData): Promise<HistoricWorkload> => {
    const id = options.id;
    const definition = (await callService('Storage:readJson', {
      folderName: `workload_history/${id}/`,
      fileName: 'definition.json',
    })) as HistoryFile;

    const history = (await callService('Storage:readJson', {
      folderName: `workload_history/${id}/`,
      fileName: 'history.json',
    })) as Array<MessageHistory>;
    return { definition, history };
  });

  ipcWrap(justRegister, 'saveHistoricWorkload', async (_event: MixedEvent, options: ElectronEventData): Promise<string> => {
    console.log('Save', options);
    const historicWorkload = options.workloadHistory as unknown as HistoricWorkload;
    if (
      !historicWorkload.definition ||
      !historicWorkload.definition.meta ||
      !historicWorkload.definition.meta.id ||
      typeof historicWorkload.history !== 'object'
    ) {
      throw 'Cannot save history without atleast a definition and history.';
    }
    await callService('Storage:writeFile', {
      folderName: `workload_history/${historicWorkload.definition.meta.id}/`,
      fileName: 'definition.json',
      contents: JSON.stringify(historicWorkload.definition),
    });

    await callService('Storage:writeFile', {
      folderName: `workload_history/${historicWorkload.definition.meta.id}/`,
      fileName: 'history.json',
      contents: JSON.stringify(historicWorkload.history),
    });

    return historicWorkload.definition.meta.id;
  });
}

//Sync function calls async but for our purpose events are registered just in
export function getElectronEngineHandlers() {
  setupElectronEngineHandlers(true);
  return functionList;
}
