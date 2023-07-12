import { WorkloadOptions } from '../../src/services/lili/interfaces/Workload/index';

import { ChatGPTAPI } from 'chatgpt';

import { getUserSetting } from '../../src/services/settings';

const api = null;

async function setupGPT(api: ChatGPTAPI | null) {
  api = new ChatGPTAPI({
    apiKey: getUserSetting('open_api_key') || '',
  });

  const res = await api.sendMessage('Hello World!');
  console.log(res.text);
}

console.log('run');
setupGPT(api);

export function startWorkload(customWorkloadOptions: WorkloadOptions) {}
