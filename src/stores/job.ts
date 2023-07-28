import { defineStore } from 'pinia';
import { getHistory, purgeHistory, getHistoricWorkload, deleteHistoricWorkload } from '../services/lili/lili_real';
import { HistoryFile } from 'app/interfaces/Lili';
import { information } from 'src/boot/lili';

export const useJobStore = defineStore('job', {
  state: () => ({
    jobHistory: [] as Array<HistoryFile>,
  }),
  actions: {
    empty() {
      this.jobHistory = [];
    },
    async getHistory(start: number, end: number, type: string) {
      this.jobHistory = await getHistory(start, end, type);
      return this.jobHistory;
    },
    async purgeHistory() {
      information('Beginning purge...');
      console.log('Purging history');
      for (const job of this.jobHistory) {
        await deleteHistoricWorkload(job.meta.id, 'history');
      }
      information('All history purged...');
      this.jobHistory = [];
    },
    getJob(jobId: string) {
      return this.jobHistory.find((job: HistoryFile) => job.meta.id === jobId);
    },
    async deleteJob(jobId: string, type: string) {
      this.jobHistory = this.jobHistory.filter((job: HistoryFile) => job.meta.id !== jobId);
      console.log('Delete', jobId);
      if (await deleteHistoricWorkload(jobId, type)) {
        information('Job deleted!');
      }
    },
    async loadJobDetail(jobId: string) {
      if (!jobId) {
        return false; //Maybe its a new job...
      }
      try {
        return await getHistoricWorkload(jobId);
      } catch (e) {
        console.log("Can't find workload with job:" + jobId + ' assuming new record');
      }
    },
  },
});
