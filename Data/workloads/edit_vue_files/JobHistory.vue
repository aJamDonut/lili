<template>
  <q-page padding>
    <div :class="lockedPageClass">
      <q-table :rows="jobStore.jobHistory" :columns="columns" row-key="id" flat bordered separator="cell">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td :props="props" v-for="row in props.cols" :key="row.name">
              <div v-if="row.name === 'id'">
                {{ row.value }}
              </div>
              <div v-else-if="row.name === 'status'">
                <q-chip size="10px" color="green" text-color="white"> COMPLETED </q-chip>
              </div>
              <div class="row items-center justify-center q-col-gutter-sm" v-else-if="row.name === 'actions'">
                <div>
                  <q-btn color="primary" :label="$t('view')" outline size="sm" @click="viewJob(props.row.id)" />
                </div>
                <div>
                  <q-btn color="red" outline size="11px" icon="close" dense @click="deleteJob(props.row.id)" />
                </div>
              </div>
              <div v-else>{{ row.value }}</div>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data>
          <div class="full-width row flex-center q-my-lg">
            <div class="text-grey-6">{{ $t('no_job_history') }}</div>
          </div>
        </template>
      </q-table>
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
      displayOutput: false,
      markdown: ' # hello world \n ```js\n function hello(){ console.log(Hello World) } \n```',
    };
  },
  computed: {
    ...mapStores(useJobStore, useSettingsStore),
    lockedPageClass() {
      return this.settingsStore.isValidKey ? '' : 'locked-page';
    },
    columns() {
      return [
        { name: 'id', label: this.$t('id'), field: (r) => r.meta.id, align: 'left', sortable: true },
        { name: 'prompt', label: this.$t('prompt'), field: (r) => r.workloadOptions.prompt, align: 'left', sortable: true },
        { name: 'workload', label: this.$t('workload'), field: (r) => r.workloadDefinition.name, align: 'left', sortable: true },
        { name: 'category', label: this.$t('category'), field: (r) => r.workloadDefinition.category, align: 'left', sortable: true },
        { name: 'status', label: this.$t('status'), field: 'status', align: 'left', sortable: true },
        { name: 'actions', label: this.$t('actions'), field: 'actions', align: 'center', sortable: false },
      ];
    },
  },
  methods: {
    viewJob(jobId) {
      this.$router.push({ path: '/jobs/' + jobId });
    },
    deleteJob(jobId) {
      console.log('Del job', jobId);
      this.jobStore.deleteJob(jobId);
    },
  },
  beforeMount() {
    this.jobStore.getHistory();
  },
};
</script>

<style lang="scss" scoped>
textarea {
  width: 100%;
  height: 200px;
}
</style>