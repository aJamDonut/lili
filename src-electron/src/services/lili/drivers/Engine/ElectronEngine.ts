import { type EventCallback, registerEvent, ElectronEventData, MixedEvent, callService } from '../../../event';

import { getHistoricWorkload, getFolderMap, getReadCallsMap, getWorkloads, runWorkload } from '../../../aiworkload';
import { WorkloadOptions } from 'app/interfaces/Workload';
import { hasValidLicense, unsetLicense, getLicense } from '../../../shopify';
import { DefinitionSource, HistoricWorkload, HistoryFile } from 'app/interfaces/Lili';
import { shell } from 'electron';

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
  ipcWrap(justRegister, 'getHistoricWorkload', async (_event: MixedEvent, options: ElectronEventData) => {
    return getHistoricWorkload(options.id as string);
  });

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
    return await getWorkloads();
  });

  ipcWrap(justRegister, 'getHistory', async (_event: MixedEvent, options: ElectronEventData) => {
    const type = (options.type ? options.type : 'history') as DefinitionSource;
    console.log('get history', options);
    const folders = getFolderMap();
    const readCalls = getReadCallsMap();

    const folder = folders[type];
    const readCall = readCalls[type];

    const getFolderCall = options.type === 'core' ? 'liliGetFolder' : 'getFolder';

    console.log('Get folder', type, folder, folders);
    let historyIds = (await callService(`Storage:${getFolderCall}`, {
      folderName: folder,
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
      const definition = (await callService(`Storage:${readCall}`, {
        folderName: `${folder}/${id}/`,
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

  ipcWrap(justRegister, 'getUserRoot', async (_event: MixedEvent) => {
    return await callService('Storage:getUserRoot', {});
  });

  ipcWrap(justRegister, 'deleteHistoricWorkload', async (_event: MixedEvent, options: ElectronEventData): Promise<boolean> => {
    const id = options.id;

    const type = (options.type ? options.type : 'history') as DefinitionSource;
    const folders = getFolderMap();

    const folder = folders[type];

    await callService('Storage:deleteFile', {
      folderName: `${folder}/${id}/`,
      fileName: 'definition.json',
    });

    await callService('Storage:deleteFile', {
      folderName: `${folder}/${id}/`,
      fileName: 'history.json',
    });

    await callService('Storage:deleteFolder', {
      folderName: `${folder}/${id}/`,
    });

    return true;
  });

  ipcWrap(justRegister, 'showFolder', async (_event: MixedEvent, options: ElectronEventData): Promise<boolean> => {
    //shell.showItemInFolder(options.folder); // Show the given file in a file manager. If possible, select the file.
    shell.openPath(options.folder as string); // Open the given file in the desktop's default manner
    return true;
  });

  ipcWrap(justRegister, 'saveHistoricWorkload', async (_event: MixedEvent, options: ElectronEventData): Promise<string> => {
    const historicWorkload = options.workloadHistory as unknown as HistoricWorkload;
    if (
      !historicWorkload.definition ||
      !historicWorkload.definition.meta ||
      !historicWorkload.definition.meta.id ||
      typeof historicWorkload.history !== 'object'
    ) {
      throw 'Cannot save history without atleast a definition and history.';
    }

    const folder = historicWorkload.definition.meta.isPrimer ? 'primer/user' : 'workload_history';

    await callService('Storage:writeFile', {
      folderName: `${folder}/${historicWorkload.definition.meta.id}/`,
      fileName: 'definition.json',
      contents: JSON.stringify(historicWorkload.definition),
    });

    await callService('Storage:writeFile', {
      folderName: `${folder}/${historicWorkload.definition.meta.id}/`,
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
