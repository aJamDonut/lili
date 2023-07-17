import { type IpcMainInvokeEvent, ipcMain, app, BrowserWindow } from 'electron';

export type ElectronEventData = {
  [key: string]: string | number | boolean | Array<string | number | boolean>;
};

export interface InternalMainInvokeEventSender {
  send: (event: string, data: unknown) => void;
}

export interface InternalMainInvokeEvent {
  sender: InternalMainInvokeEventSender;
}

export type MixedEvent = IpcMainInvokeEvent | InternalMainInvokeEvent;

export type EventCallback = (_event: MixedEvent, data: ElectronEventData) => unknown;

export type ElectronEvents = {
  [key: string]: EventCallback;
};

const events: ElectronEvents = {};

//TODO: implement real?
export function createMockInternalEvent(): InternalMainInvokeEvent {
  return {
    sender: {
      send: (eventName: string, ...args: any[]) => {
        ipcMain.emit(eventName, ...args);
      },
    },
  };
}
/**
 * Register an event for use internall on the backend
 * @param event The name of the event
 * @param callback Callback to run the event
 */
export function registerInternalEvent(event: string, callback: EventCallback) {
  events[event] = callback;
}

/**
 * Register an event which is available on a bridge to the client
 * @param event The name of the event
 * @param callback Callback to run the event
 */
export function registerClientEvent(event: string, callback: EventCallback) {
  ipcMain.handle(event, callback);
}

/**
 * Register an event both internally and on the bridge to the client
 * @param event The name of the event
 * @param callback Callback to run the event
 */
export function registerEvent(event: string, callback: EventCallback) {
  registerInternalEvent(event, callback);
  registerClientEvent(event, callback);
}

import { cliOut } from '../cli';

export function showInfo(content: string, linkLabel?: string, linkUrl?: string) {
  const status = 'information';
  if (!app.commandLine.hasSwitch('cli')) {
    return cliOut(content);
  } else {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    try {
      if (focusedWindow)
        focusedWindow.webContents.send(`LiliEngine:notify`, { status, content, linkLabel, linkUrl });
    } catch (e) {
      console.log(e);
    }
  }
}

export function showError(content: string, linkLabel?: string, linkUrl?: string) {
  const status = 'error';
  if (!app.commandLine.hasSwitch('cli')) {
    return cliOut(content);
  } else {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    try {
      if (focusedWindow)
        focusedWindow.webContents.send(`LiliEngine:notify`, { status, content, linkLabel, linkUrl });
    } catch (e) {
      console.log(e);
    }
  }
}
export function showWarning(content: string, linkLabel?: string, linkUrl?: string) {
  const status = 'warning';
  if (!app.commandLine.hasSwitch('cli')) {
    return cliOut(content);
  } else {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    try {
      if (focusedWindow)
        focusedWindow.webContents.send(`LiliEngine:notify`, { status, content, linkLabel, linkUrl });
    } catch (e) {
      console.log(e);
    }
  }
}

export async function callService(event: string, data: ElectronEventData) {
  console.log('Call ' + event);
  console.log('Data', data);
  if (!events[event]) {
    console.error('[LILI-ALERT] Cannot find event: ' + event);
    console.log('Events', events);
    return false;
  }

  console.log(events[event].toString());

  return await events[event].call(null, createMockInternalEvent(), data);
}
