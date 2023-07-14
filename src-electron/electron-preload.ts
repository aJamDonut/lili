import { contextBridge, ipcRenderer } from 'electron';
import { getElectronStorageHandlers } from './src/services/storage/ElectronStorage';
import { getElectronEngineHandlers } from './src/services/lili/drivers/Engine/ElectronEngine';
async function getAllowedList() {
  return [...(await getElectronStorageHandlers()), ...(await getElectronEngineHandlers())];
}

contextBridge.exposeInMainWorld('_electron', {
  run: async (event: string, data: object) => {
    console.log('Will run', event);
    const allowedEventsList = await getAllowedList();
    console.log('Events', allowedEventsList);
    //Check it is in the list of allowed events
    if (!allowedEventsList.includes(event)) {
      console.error('Cannot execute non-allowed run event: ' + event);
      return 'Cannot execute non-allowed run event: ' + event;
    }
    console.log('Run with data', data);
    //It's okay to run it, let's run it.
    return await ipcRenderer.invoke(event, data);
  },
  on: async (event: string, callback: any) => {
    console.log('Will run', event);
    ipcRenderer.removeAllListeners(event); //Remove any active listeners
    const allowedEventsList = await getAllowedList();
    console.log('On event', event);

    //Check it is in the list of allowed events
    if (!allowedEventsList.includes(event)) {
      console.error('Cannot execute non-allowed on event: ' + event);
      return 'Cannot execute non-allowed on event: ' + event;
    }

    ipcRenderer.on(event, callback);
  },
  off: async (event: string) => {
    const allowedEventsList = await getAllowedList();
    console.log('Remove listener', event);
    //Check it is in the list of allowed events
    if (!allowedEventsList.includes(event)) {
      console.error('Cannot execute non-allowed event: ' + event);
      return 'Cannot execute non-allowed event: ' + event;
    }
    return ipcRenderer.removeAllListeners(event);
  },
});
