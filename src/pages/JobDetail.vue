<template>
  <q-page padding class="job-detail">
    <div>
      <q-card class="job-info-card">
        <div class="q-pa-md">
          <div class="row items-start">
            <div class="q-col-gutter-md">
              <div class="text-h6">{{ $t('workload_id') }}</div>
              <div class="text-subtitle1">{{ job.definition.meta.id }}</div>
            </div>
            <div class="q-col-gutter-md">
              <div class="text-h6">{{ $t('prompt') }}:</div>
              <div class="text-subtitle1">{{ job.prompt }}</div>
            </div>
          </div>
          <div class="row items-start q-mt-md">
            <div class="q-col-gutter-md">
              <div class="text-h6">{{ $t('workload') }}:</div>
              <div class="text-subtitle1">{{ job.workload }}</div>
            </div>
            <div class="q-col-gutter-md">
              <div class="text-h6">{{ $t('category') }}:</div>
              <div class="text-subtitle1">{{ job.category }}</div>
            </div>
          </div>
          <div class="q-mt-md">
            <div class="text-h6">{{ $t('status') }}:</div>
            <q-chip size="10px" :color="statusColor" text-color="white">{{ job.status }}</q-chip>
          </div>
        </div>
        <q-separator />
        <div class="q-pa-md">
          <div class="text-h6">{{ $t('actions') }}:</div>
          <q-btn color="red" :label="$t('delete')" outline dense @click="deleteJob(job.id)" class="q-mr-sm" />
          <q-btn color="accent" :label="$t('download')" outline dense @click="downloadJob(job.id)" />
        </div>
      </q-card>
      <br />
      <q-card>
        <q-card-section>
          <div class="text-h5 mb-sm">{{ $t('job_history') }}</div>
          <q-list bordered>
            <q-item v-for="message in job.history" :key="message.id">
              <q-item-section>
                <q-input v-model="message.role" filled type="textarea" rows="1" autogrow dense class="q-mb-md"></q-input>
                <q-input v-model="message.content" filled type="textarea" rows="2" autogrow dense
                  class="q-mb-md"></q-input>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
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
    deleteJob(jobId) {
      this.jobStore.deleteJob(jobId);
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
