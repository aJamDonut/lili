import { callService } from '../event';

export type UserSettings = {
  [key: string]: unknown;
};

export async function getUserSetting(key: string) {
  let storedSettings = (await callService('Storage:readJson', {
    folderName: 'config',
    fileName: 'settings.json',
  })) as UserSettings;
  if (!storedSettings) {
    storedSettings = {};
  }
  console.log('Settings', storedSettings);
  return storedSettings[key];
}

export async function getApiKey() {
  return (await getUserSetting('chatGPTKey')) as string;
}

export async function hasApiKey() {
  const apiKey = await getUserSetting('chatGPTKey');
  return apiKey ? true : false;
}
