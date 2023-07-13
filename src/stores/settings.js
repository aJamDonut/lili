import { defineStore } from 'pinia';
import { ElectronStorage as Storage } from '../services/storage';


export const useSettingsStore = defineStore('settings', {
  state: () => ({
    sliderInputs: true,
    darkMode: 'auto',
    chatGPTKey: '',
    splitterWidth: 25
  }),
  actions: {
    async load() {
      const storage = new Storage();
      const settings = await storage.readJson('config', 'settings.json');

      if (settings) {
        Object.keys(settings).forEach(key => {
          this[key] = settings[key];
        })
      }

      return settings;
    }
  },
});
