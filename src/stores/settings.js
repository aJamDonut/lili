import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    sliderInputs: true,
    darkMode: 'auto',
    chatGPTKey: ''
  })
});
