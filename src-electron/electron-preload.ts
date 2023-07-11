/*
This is a custom implementation.
It's always custom, because it's quite important we get it right.
We will register some backend events
Those events have names which are added to the "allowedEventsList"
If the event that was passed doesn't exist in the list. It does not invoke it.
*/
import { contextBridge, ipcRenderer } from 'electron';

//Import a list of handlers for security purposes

import { getElectronStorageHandlers } from './src/ElectronStorage';
import { getElectronEngineHandlers } from './src/ElectronEngine';
const allowedEventsList = [
  ...getElectronStorageHandlers(),
  ...getElectronEngineHandlers(),
];

contextBridge.exposeInMainWorld('_electron', {
  run: async (event: string, data: object) => {
    console.log('Run event', event);
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
    console.log('On event', event);

    //Check it is in the list of allowed events
    if (!allowedEventsList.includes(event)) {
      console.error('Cannot execute non-allowed on event: ' + event);
      return 'Cannot execute non-allowed on event: ' + event;
    }

    ipcRenderer.on(event, callback);
  },
  off: (event: string) => {
    console.log('Remove listener', event);
    //Check it is in the list of allowed events
    if (!allowedEventsList.includes(event)) {
      console.error('Cannot execute non-allowed event: ' + event);
      return 'Cannot execute non-allowed event: ' + event;
    }
    return ipcRenderer.removeAllListeners(event);
  },
});
