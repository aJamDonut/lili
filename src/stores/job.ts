import { defineStore } from 'pinia';
import { getHistory, purgeHistory, getHistoricWorkload, deleteHistoricWorkload } from '../services/lili/lili_real';
import { HistoryFile } from 'app/interfaces/Lili';
import { information } from 'src/boot/lili';

export const useJobStore = defineStore('job', {
  state: () => ({
    jobHistory: [] as Array<HistoryFile>,
  }),
  actions: {
    async getHistory() {
      this.jobHistory = await getHistory(0, 100);
      return this.jobHistory;
    },
    async purgeHistory() {
      information('Beginning purge...');
      console.log('Purging history');
      for (const job of this.jobHistory) {
        await deleteHistoricWorkload(job.meta.id);
      }
      information('All history purged...');
      this.jobHistory = [];
    },
    getJob(jobId: string) {
      return this.jobHistory.find((job: HistoryFile) => job.meta.id === jobId);
    },
    async deleteJob(jobId: string) {
      this.jobHistory = this.jobHistory.filter((job: HistoryFile) => job.meta.id !== jobId);
      console.log('Delete', jobId);
      if (await deleteHistoricWorkload(jobId)) {
        information('Job deleted!');
      }
    },
    async loadJobDetail(jobId: string) {
      return await getHistoricWorkload(jobId);
    },
  },
});
