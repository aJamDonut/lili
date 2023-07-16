import { defineStore } from 'pinia';
import { ElectronStorage as Storage } from 'services/storage';
import { getLicense, unsetLicense } from 'src/services/lili/lili_real';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    sliderInputs: true,
    showAdvanced: false,
    workload: { label: 'Change files', value: 'change_files' },
    darkMode: 'auto',
    chatGPTKey: '',
    splitterWidth: 25,
    liliKey: '',
    isValidKey: false,
  }),
  actions: {
    async checkKey() {
      if (this.isValidKey) {
        await unsetLicense();
      }
      this.isValidKey = false;
      const response = await getLicense(this.liliKey)

      console.log('checking Key: ' + this.liliKey, response)

      this.isValidKey = response.valid;
      return this.isValidKey;
    },
    async load() {
      const storage = new Storage();
      const settings = await storage.readJson('config', 'settings.json');

      if (settings) {
        Object.keys(settings).forEach((key) => {
          this[key] = settings[key];
        });
      }

      // Check license key
      this.checkKey();

      return settings;
    },
  },
});
