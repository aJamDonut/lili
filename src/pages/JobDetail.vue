<template>
  <q-page padding class="job-detail">
    <div>
      <q-btn dense flat size="sm" :label="$t('job_history')" text-color="grey-5" icon="arrow_back" @click="$router.back()" class="q-py-sm q-pr-sm q-mb-sm" />
      <div class="row q-mb-md">
        <div class="col">
          <lili-cont title="Workload Id">
            <div class="text-subtitle1">{{ job.definition.meta.id }}</div>
          </lili-cont>
        </div>
      </div>
      <lili-cont :title="$t('history')" class="q-mb-sm">
        <div v-for="(message, index) in job.history" :key="index" class="row items-start q-col-gutter-sm q-mb-sm">
          <div class="col-2">
            <q-select v-model="message.role" filled :options="roleOptions" dense></q-select>
          </div>
          <div class="col">
            <q-input v-model="message.content" filled rows="2" :autogrow="this.autoGrow[index]" @focus="this.autoGrow[index] = true;" @blur="onBlur(index)" dense></q-input>
          </div>
          <div class="col-shrink">
            <q-btn flat dense color="red" icon="close" class="q-mt-xs" @click="deleteMessage(index)" />
          </div>
        </div>
        <div class="row items-center justify-end">
          <div>
            <q-btn flat dense icon="add" color="positive" @click="job.history.push({ role: 'user', content: '' })" />
          </div>
        </div>
      </lili-cont>
    </div>
  </q-page>
</template>


<script>
import { mapStores } from 'pinia';
import { useJobStore } from 'src/stores/job';
import { useSettingsStore } from 'stores/settings';

export default {
  data() {
    return {
      job: { definition: { meta: {} }, history: [{ role: 'user', content: 'hello world' }] },
      roleOptions: [
        { label: 'User', value: 'user' },
        { label: 'liliFLOW', value: 'lili' },
        { label: 'Assistant', value: 'assistant' },
        { label: 'System', value: 'system' },
      ],
      count: 0,
      autoGrow: {}
    };
  },
  computed: {
    ...mapStores(useJobStore, useSettingsStore),

    formattedOutput() {
      if (this.job && this.job.history) {
        return this.job.history.map((line) => JSON.stringify(line, null, 2)).join('\n');
      }
      return '';
    },
    statusColor() {
      return this.job && this.job.status === 'COMPLETED' ? 'green' : 'orange';
    },
  },
  methods: {
    onBlur(index) {
      this.count++
      if (this.count > 1) {
        this.autoGrow[index] = false
        this.count = 0
      }
    },
    deleteJob(jobId) {
      this.jobStore.deleteJob(jobId);
    },
    autoGrowEnabled(index) {
      if (this.autoGrow[index] === true) {
        return true
      }
      return false
    },
    deleteMessage(index) {
      this.job.history.splice(index, 1);
    },
    downloadJob(jobId) {
      const jobInfo = this.jobStore.loadJobDetail(jobId);
      // Download logic here
    },
  },
  async beforeMount() {
    this.job = await this.jobStore.loadJobDetail(this.$route.params.id);
    console.log('jobo', this.job);
  },
};
</script>
