import { defineStore } from 'pinia';
import { ElectronStorage as Storage } from 'services/storage';
import { getLicense, unsetLicense } from 'src/services/lili/lili_real';

const APP_VERSION = '0.3.3'; //Move to package.json when used properly (app.getVersion() in electron)

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    sliderInputs: true,
    showAdvanced: false,
    workload: { label: 'Normal GPT', value: 'just_gpt' },
    darkMode: 'auto',
    chatGPTKey: '',
    splitterWidth: 25,
    liliKey: '',
    isValidKey: false,
    language: 'en-US',
    session: '',
    ranOnce: false, //Required for auto-update (there is a known bug)
  }),
  actions: {
    async checkKey() {
      if (this.isValidKey) {
        await unsetLicense();
      }
      this.isValidKey = false;
      const response = await getLicense(this.liliKey);

      console.log('checking Key: ' + this.liliKey, response);

      this.isValidKey = response.valid;
      return this.isValidKey;
    },
    //Move to backend later
    async getVersion() {
      return APP_VERSION;
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
