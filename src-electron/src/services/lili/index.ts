import { WorkloadOptions } from '../../src/services/lili/interfaces/Workload';

import { ChatGPTAPI } from 'chatgpt';

import { getUserSetting } from '../settings/index';

import { ElectronStorage } from './drivers/Storage/ElectronStorage';

const api = null;

async function setupGPT(api: ChatGPTAPI | null) {
  api = new ChatGPTAPI({
    apiKey: getUserSetting('open_api_key') || '',
  });

  const res = await api.sendMessage('Hello World!');
  console.log(res.text);
}

setupGPT(api);
