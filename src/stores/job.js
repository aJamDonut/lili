import { defineStore } from 'pinia';
import { getHistory, getHistoricWorkload } from '../services/lili/lili_real';

export const useJobStore = defineStore('job', {
  state: () => ({
    jobHistory: []
  }),
  actions: {
    async getHistory () {
      this.jobHistory = await getHistory()
      return this.jobHistory;
    },
    getJob (jobId) {
      return this.jobHistory.find((job) => job.id === jobId);
    },
    deleteJob (jobId) {
      this.jobHistory = this.jobHistory.filter((job) => job.id !== jobId);
    }
  }
});
