import { ChatGPTAPI } from 'chatgpt';

import { getUserSetting } from '../settings/index';

const api = null;

async function setupGPT(api: ChatGPTAPI | null) {
  api = new ChatGPTAPI({
    apiKey: getUserSetting('open_api_key') || '',
  });

  const res = await api.sendMessage('Hello World!');
  console.log(res.text);
}



setupGPT(api);

import { ipcRenderer } from 'electron';

export const 
ipcRenderer.invoke('Storage:writeFile', {
  fileName: 'testo.txt',
  contents: 'testuruuu',
});
