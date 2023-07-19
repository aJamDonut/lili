<template>
  <q-page padding>
    <div :class="lockedPageClass">
      <q-table :rows="jobStore.jobHistory" :pagination="pagination" :columns="columns" row-key="id" flat bordered separator="cell">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td :props="props" v-for="row in props.cols" :key="row.name">
              <div class="row items-center justify-center q-col-gutter-sm" style="min-width: 180px" v-if="row.name === 'actions'">
                <div>
                  <q-btn outline color="primary" size="11px" icon="replay"  :to="{ path: '/job/' + props.row.meta.id }" />
                </div>
                <div>
                  <q-btn outline color="orange-8" size="11px" icon="tune"  :to="{ path: '/edit/' + props.row.meta.id }" />
                </div>
                <div>
                  <q-btn outline color="red" size="11px" icon="close"  @click="deleteJob(props.row.id)" />
                </div>
              </div>
              <div v-else-if="row.name === 'id'">
                {{ row.value }}
              </div>
              <div v-else-if="row.name === 'status'">
                <q-chip size="10px" color="green" text-color="white"> COMPLETED </q-chip>
              </div>
              <div class="truncate" v-else>{{ row.value }}</div>
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
    <locked-overlay />
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
      pagination: {
        rowsPerPage: 15,
        sortBy: 'id',
        descending: true,
      }
    };
  },
  computed: {
    ...mapStores(useJobStore, useSettingsStore),
    lockedPageClass() {
      return this.settingsStore.isValidKey ? '' : 'locked-page';
    },
    columns() {
      /*
      {
        "meta": { "id": "2023_07_17_20_06_08", "date": 1689620983264 },
        "workloadDefinition": {
          "name": "Fake SQL server",
          "codename": "fake_sql",
          "description": "Pretends to be an SQL server",
          "category": "general",
          "defaults": {
            "advanced": { "repetitiveness": 1.5, "creativity": 0, "tokenLength": 15000, "solutionCount": 1 }
          },
          "messageHistory": []
        },
        "workloadOptions": {
          "prompt": "select * from users;",
          "context": "",
          "workload": "fake_sql",
          "outputFormat": "plaintext",
          "outputTo": "inline",
          "creativity": 0.1,
          "repetitiveness": 0.1,
          "responseLimit": 10,
          "solutionCount": 1,
          "onJsonResponse": null,
          "id": "2023_07_17_20_06_08"
        }
      }
      */

      return [
        { name: 'actions', label: this.$t('actions'), field: 'actions', align: 'center', sortable: false, headerClasses: 'q-table--col-auto-width' },
        { name: 'id', label: this.$t('id'), field: (r) => r.meta.id, align: 'left', sortable: true, headerClasses: 'q-table--col-auto-width' },
        { name: 'prompt', label: this.$t('prompt'), field: (r) => r.workloadOptions.prompt, align: 'left', sortable: true },
        { name: 'workload', label: this.$t('workload'), field: (r) => r.workloadDefinition.name, align: 'left', sortable: true, headerClasses: 'q-table--col-auto-width' },
        { name: 'status', label: this.$t('status'), field: 'status', align: 'left', sortable: true, headerClasses: 'q-table--col-auto-width' },
      ];
    },
  },
  methods: {
    viewJob(jobId) {
      this.$router.push({ path: '/jobs/' + jobId });
    },
    deleteJob(jobId) {
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
.truncate {
  width: 100px;
  white-space: nowrap; /* Prevents text from wrapping */
  overflow: hidden; /* Hides overflowing text */
  text-overflow: ellipsis; /* Displays an ellipsis (...) for trimmed text */
}
</style>