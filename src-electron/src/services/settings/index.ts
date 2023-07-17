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
  let settings = await getSettingsFile();
  settings[key] = value;
  let storedSettings = (await callService('Storage:writeFile', {
    folderName: 'config',
    fileName: 'settings.json',
    content: JSON.stringify(settings),
  })) as UserSettings;
}

export async function getApiKey() {
  return (await getUserSetting('chatGPTKey')) as string;
}

let offsetStart = 's';
let offsetAmount = 0;
function getOffset(value?: string) {
  if (value) {
    return value.charCodeAt(offsetAmount);
  }
  return offsetStart.charCodeAt(offsetAmount);
}

interface LiliSession {
  _offset_start: string;
  _skcu_id: number;
  _skcu: string;
}

const MAX_TRIAL = 10;
function getRandomNumber(min: number, max: number) {
  // Generate a random number between min (inclusive) and max (inclusive)
  return Math.floor(min + Math.random() * (max + 1 - min));
}
function newSKCU(distance: number) {
  let str = '';
  for (let i = 0; i <= 9; i++) {
    if (distance === i) {
      str = str + offsetStart;
    }
    str = str + String.fromCharCode(getRandomNumber(65, 65 + 24));
  }
  return str;
}
function getDistance() {
  return getRandomNumber(0, 9);
}
export async function getSession() {
  let session = (await getUserSetting('session')) as LiliSession | string;
  offsetStart = String.fromCharCode(getRandomNumber(65, 65 + 24));
  if (!session || typeof session === 'string') {
    //No session
    offsetAmount = getDistance(); //Get new distance
    session = {
      _offset_start: offsetStart,
      _skcu_id: offsetAmount,
      _skcu: newSKCU(offsetAmount),
    };
  }
  setUserSetting('session', session);
  return session;
}

export async function useTrial() {
  if ((await getLicenseLeft()) < 1) {
    showError('Trial has expired.');
    return;
  }
  let session = await getSession();
  if (!session) {
    throw 'Failed trying to use a trial';
  }
  let current = getOffset(session._skcu);
  session._skcu =
    String.fromCharCode(current++) +
    String.fromCharCode(Math.random() * 100) +
    String.fromCharCode(Math.random() * 100) +
    String.fromCharCode(Math.random() * 100);
}

export async function getLicenseLeft() {
  let session = await getSession();
  let count = getOffset(session._skcu) - getOffset();
  return MAX_TRIAL - count;
}

export async function getLicenseKey() {
  return (await getUserSetting('liliKey')) as string;
}

export async function hasApiKey() {
  const apiKey = await getUserSetting('chatGPTKey');
  return apiKey ? true : false;
}
