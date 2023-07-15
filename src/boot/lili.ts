import { boot } from 'quasar/wrappers';
import { useWorkloadsStore } from 'src/stores/workloads';

const workloads = useWorkloadsStore();

export default boot(({ app }) => {
  workloads.load();
});
