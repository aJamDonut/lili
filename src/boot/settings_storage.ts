import { boot } from 'quasar/wrappers';
import { watch } from 'vue';
import { useSettingsStore } from 'stores/settings';
import { ElectronStorage as Storage } from '../services/storage';

const settings = useSettingsStore();

export default boot(({ app }) => {
  settings.load();
});

type TimerId = NodeJS.Timeout | null;
let timerId: TimerId = null;

watch(
  settings.$state,
  async (state) => {
    // Add sleep timer to prevent too many writes
    // Cancel and create new timer on each change
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(async () => {
      console.log('settings Storage write', state);
      const storage = new Storage();
      await storage.writeFile('config', 'settings.json', JSON.stringify(state));
    }, 500);
    // const storage = new Storage();
    // await storage.writeFile('config', 'settings.json', JSON.stringify(state));
  },
  { deep: true }
);
