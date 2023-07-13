import { watch } from "vue";
import { useSettingsStore } from "../stores/settings";
import { ElectronStorage as Storage } from '../services/storage';

const settings = useSettingsStore();

console.log('settings Storage', settings.$state)

watch(
  settings.$state,
  async (state) => {
    const storage = new Storage();
    await storage.writeFile('config', 'settings.json', JSON.stringify(state));
  },
  { deep: true }
  );