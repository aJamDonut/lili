import { ElectronStorage as Storage } from '../storage';

export type UserSettings = {
  [key: string]: unknown;
};

let SETTINGS: UserSettings = {};

export async function loadDefaultSettings() {
  const store = new Storage();
  if (!(await store.fileExists('settings', 'user.json'))) {
    await store.writeFile('settings', 'user.json', JSON.stringify(SETTINGS));
  }
  SETTINGS = (await store.readJson('settings', 'user.json')) as UserSettings;
}

export function getSetting(name: string) {
  return SETTINGS[name];
}

export function setSetting(name: string, value: unknown) {
  return (SETTINGS[name] = value);
}

console.log('API Key', getSetting('API_KEY'));
console.log('API Key2', setSetting('API_KEY', 'badger'));
console.log('API Key3', getSetting('API_KEY'));
