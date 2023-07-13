import { defineStore } from 'pinia';
import { ElectronStorage as Storage } from '../services/storage';

const storage = new Storage();
const settings = await storage.readJson('config', 'settings.json');

export const useSettingsStore = defineStore('settings', {
  state: () => {
    let data = {
      sliderInputs: true,
      darkMode: 'auto',
      chatGPTKey: ''
    }

    if (settings) {
      Object.keys(settings).forEach(key => {
        data[key] = settings[key];
      })
    }

    return data;
  },
  actions: {
    async load() {
      const storage = new Storage();
      const settings = await storage.readJson('config', 'settings.json');

      if (settings) {
        Object.keys(settings).forEach(key => {
          data[key] = settings[key];
        })
      }

      return settings;
    }
  },
});
