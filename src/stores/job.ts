import { defineStore } from 'pinia';
import { getHistory, getHistoricWorkload } from '../services/lili/lili_real';
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
    getJob(jobId: string) {
      return this.jobHistory.find((job: HistoryFile) => job.meta.id === jobId);
    },
    deleteJob(jobId: string) {
      this.jobHistory = this.jobHistory.filter((job: HistoryFile) => job.meta.id !== jobId);
    },
  },
});
