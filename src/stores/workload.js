import { defineStore } from 'pinia';
import { getWorkloads } from 'src/services/lili/lili_real';

export const useWorkloadStore = defineStore('workload', {
  state: () => ({
    workloads: [],
  }),
  actions: {
    async load() {
      this.refresh();
    },
    async refresh() {
      this.workloads = await getWorkloads();
    },
    getWorkload(id) {
      return this.workloads.find((workload) => workload.id === id);
    },
  },
});
