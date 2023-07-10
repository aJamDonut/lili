import { ipcRenderer } from 'electron';

export async function ipcWrapper(event: string, send: Array<string>) {
  ipcRenderer.send(event, send);

  return new Promise((resolve) => {
    const replyName = event + '-reply';
    ipcRenderer.on(replyName, (_event, response) => {
      ipcRenderer.removeAllListeners(replyName);
      resolve(response);
    });
  });
}
