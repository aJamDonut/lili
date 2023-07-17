import { contextBridge, ipcRenderer } from 'electron';
import { getElectronStorageHandlers } from './src/services/storage/ElectronStorage';
import { getElectronEngineHandlers } from './src/services/lili/drivers/Engine/ElectronEngine';
import { getElectronWindowHandlers } from './src/services/window';

//IMPORTANT: DO NOT USE 'electron/remote' that is for people who don't understand Web Security!!!!!

function getAllowedList() {
  return [...getElectronStorageHandlers(), ...getElectronEngineHandlers(), ...getElectronWindowHandlers()];
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
    ipcRenderer.on(event, (_event: Electron.IpcRendererEvent, ...args) => {
      callback(...args);
    });
  },
  off: async (event: string) => {
    return ipcRenderer.removeAllListeners(event);
  },
});
