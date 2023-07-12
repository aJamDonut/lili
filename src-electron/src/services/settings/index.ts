export function getUserSetting(key: string) {
  if (key === 'open_api_key') {
    return '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';
  }
}

export const getApiKey = () => {
  return getUserSetting('open_api_key');
};

export const hasApiKey = () => {
  return getApiKey() ? true : false;
};
