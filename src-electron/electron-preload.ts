import { contextBridge, ipcRenderer } from 'electron';
import { getElectronStorageHandlers } from './src/services/storage/ElectronStorage';
import { getElectronEngineHandlers } from './src/services/lili/drivers/Engine/ElectronEngine';

function getAllowedList() {
  return [...getElectronStorageHandlers(), ...getElectronEngineHandlers()];
}

const allowedEventsList = getAllowedList();
contextBridge.exposeInMainWorld('_electron', {
  run: async (event: string, data: object) => {
    //Check it is in the list of allowed events
    if (!allowedEventsList.includes(event)) {
      console.error('Cannot execute non-allowed run event: ' + event);
      return 'Cannot execute non-allowed run event: ' + event;
    }
    //It's okay to run it, let's run it.
    return await ipcRenderer.invoke(event, data);
  },
  on: async (event: string, callback: any) => {
    ipcRenderer.removeAllListeners(event); //Remove any active listeners
    //Check it is in the list of allowed events
    if (!allowedEventsList.includes(event)) {
      console.error('Cannot execute non-allowed on event: ' + event);
      return 'Cannot execute non-allowed on event: ' + event;
    }
    ipcRenderer.on(event, callback);
  },
  off: async (event: string) => {
    //Check it is in the list of allowed events
    if (!allowedEventsList.includes(event)) {
      return 'Cannot execute non-allowed event: ' + event;
    }
    return ipcRenderer.removeAllListeners(event);
  },
});
