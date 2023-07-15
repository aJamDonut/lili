import { defineStore } from 'pinia';
import { getWorkloads } from 'src/services/lili/lili_real';

export const useWorkloadsStore = defineStore('workloads', {
  state: () => ({
    workloads: [],
  }),
  actions: {
    async load() {
      this.workloads = await getWorkloads();
    },
  },
});
