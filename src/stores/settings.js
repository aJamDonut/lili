import { defineStore } from 'pinia';
import { ElectronStorage as Storage } from 'services/storage';
import { getLicense, getVersion, unsetLicense } from 'src/services/lili/lili_real';

const APP_VERSION = getVersion();

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    /* Persistent Variables */
    showAdvanced: false,
    workload: { label: 'Normal GPT', value: 'just_gpt' },
    splitterWidth: 25,
    isValidKey: false,
    session: '',

    /* User Preferences */
    darkMode: 'auto',
    language: 'en-US',
    sliderInputs: true,
    workspace_context_files: true,
    workspace_context_tree: true,

    /* Keys */
    liliKey: '',
    chatGPTKey: '',
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
