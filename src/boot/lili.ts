import { Notify } from 'quasar';
import { boot } from 'quasar/wrappers';
import { useWorkloadsStore } from 'src/stores/workloads';
import { on } from '../services/electron';
import { type Router } from 'vue-router';

const workloads = useWorkloadsStore();

interface LiliNotification {
  status: 'warning' | 'information' | 'error';
  content: string;
  linkLabel?: string;
  linkUrl?: string;
}

function getActions(router: Router, message: LiliNotification) {
  return [
    {
      label: message.linkLabel,
      handler: () => {
        if (message.linkUrl) router.push(message.linkUrl);
      },
    },
  ];
}

export function error(content: string) {
  createNotification({ content, status: 'error' });
}

export function warning(content: string) {
  createNotification({ content, status: 'warning' });
}

export function information(content: string) {
  createNotification({ content, status: 'information' });
}

const colors = {
  valid: 'green-8',
  warning: 'orange-8',
  information: 'primary',
  error: 'red-8',
};

export let createNotification = (message: LiliNotification) => {
  console.log(message);
};

export default boot(({ app, router }) => {
  workloads.load();

  createNotification = (message: LiliNotification) => {
    console.log('Create note', message);
    const actions = !message.linkLabel ? [] : getActions(router, message);
    Notify.create({
      group: false,
      message: message.content,
      color: colors[message.status],
      position: 'bottom-right',
      actions: actions,
    });
  };

  on('LiliEngine:notify', (message: LiliNotification) => {
    createNotification(message);
  });
});
