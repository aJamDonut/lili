import { defineStore } from 'pinia';
import { getHistory, purgeHistory, getHistoricWorkload } from '../services/lili/lili_real';
import { HistoryFile } from 'app/interfaces/Lili';

export const useJobStore = defineStore('job', {
  state: () => ({
    jobHistory: [] as Array<HistoryFile>,
  }),
  actions: {
    async getHistory() {
      this.jobHistory = await getHistory(0, 100);
      return this.jobHistory;
    },
    purgeHistory() {
      console.log('Purging history');
      this.jobHistory = [];
      purgeHistory();
    },
    getJob(jobId: string) {
      return this.jobHistory.find((job: HistoryFile) => job.meta.id === jobId);
    },
    deleteJob(jobId: string) {
      this.jobHistory = this.jobHistory.filter((job: HistoryFile) => job.meta.id !== jobId);
    },
    async loadJobDetail(jobId: string) {
      return await getHistoricWorkload(jobId);
    },
  },
});
