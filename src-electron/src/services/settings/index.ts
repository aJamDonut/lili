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

const offsetStart = 's';

function getOffset(value?: string) {
  if (value) {
    return value.charCodeAt(0);
  }
  return offsetStart.charCodeAt(0);
}

interface LiliSession {
  _skcu: string;
}

const MAX_TRIAL = 10;

export async function getSession() {
  let session = (await getUserSetting('session')) as LiliSession | string;

  if (!session || typeof session === 'string') {
    //No session
    session = {
      _skcu: offsetStart,
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
  session._skcu = String.fromCharCode(current++);
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
