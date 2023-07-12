import { type IpcMainInvokeEvent, ipcMain } from 'electron';

export type ElectronEventData = {
  [key: string]: unknown;
};

export interface InternalMainInvokeEventSender {
  send: (event: string, data: unknown) => void;
}

export interface InternalMainInvokeEvent {
  sender: InternalMainInvokeEventSender;
}

export type MixedEvent = IpcMainInvokeEvent | InternalMainInvokeEvent;

export type EventCallback = (_event: MixedEvent, data: ElectronEventData) => object;

export type ElectronEvents = {
  [key: string]: EventCallback;
};

const events: ElectronEvents = {};

//TODO: implement real?
export function createMockInternalEvent(): InternalMainInvokeEvent {
  return {
    sender: {
      send: () => {
        console.log('_event.sender.send NOT IMPLEMENTED IN BACKEND YET');
      },
    },
  };
}

export function registerEvent(event: string, callback: EventCallback) {
  //Register for internal use
  events[event] = callback;
  //Register for bridge
  ipcMain.handle(event, callback);
}

export async function callService(event: string, data: ElectronEventData) {
  console.log('Call ' + event);
  console.log('Data', data);
  console.log(events[event].toString());
  return await events[event].call(null, createMockInternalEvent(), data);
}
