import { callService, showError } from '../event';

export type UserSettings = {
  [key: string]: unknown;
};

async function getSettingsFile() {
  return (await callService('Storage:readJson', {
    folderName: 'config',
    fileName: 'settings.json',
  })) as UserSettings;
}

export async function getUserSetting(key: string) {
  let storedSettings = await getSettingsFile();
  if (!storedSettings) {
    storedSettings = {};
  }
  console.log('Settings', storedSettings);
  return storedSettings[key];
}

export async function setUserSetting(key: string, value: unknown) {
  const settings = await getSettingsFile();
  settings[key] = value;
  (await callService('Storage:writeFile', {
    folderName: 'config',
    fileName: 'settings.json',
    content: JSON.stringify(settings),
  })) as UserSettings;
}

export async function getApiKey() {
  return (await getUserSetting('chatGPTKey')) as string;
}

export async function getLicenseKey() {
  return (await getUserSetting('liliKey')) as string;
}

export async function hasApiKey() {
  const apiKey = await getUserSetting('chatGPTKey');
  return apiKey ? true : false;
}
