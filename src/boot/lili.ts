import { Notify } from 'quasar';
import { boot } from 'quasar/wrappers';
import { useWorkloadsStore } from 'src/stores/workloads';
import { on } from '../services/electron';

const workloads = useWorkloadsStore();

interface LiliNotification {
  status: 'warning' | 'information' | 'error';
  content: string;
  linkLabel?: string;
  linkUrl?: string;
}

const colors = {
  warning: 'yellow',
  information: 'yellow',
  error: 'red',
};

export default boot(({ app }) => {
  workloads.load();

  const handler = () => {
    this.$router.push();
  };

  on('LiliEngine:notify', (message: LiliNotification) => {
    const actions = !message.linkLabel ? [] : [{ label: message.linkLabel, handler }];
    Notify.create({
      group: false,
      message: message.content,
      color: colors[message.status],
      position: 'bottom-right',
      actions: actions,
    });
  });
});
