<template>
  <q-page padding>
    <div>
      <lili-title :title="pageTitle" :desc="pageDesc" />
      <q-table :rows="jobStore.jobHistory" :pagination="pagination" :columns="columns" row-key="id" flat bordered separator="cell">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td :props="props" v-for="row in props.cols" :key="row.name">
              <div class="row items-center justify-center q-col-gutter-sm" style="min-width: 180px" v-if="row.name === 'actions'">
                <div>
                  <div v-if="historyType === 'history'">
                    <q-btn outline color="primary" size="11px" icon="replay" :to="{ path: '/job/history/' + props.row.meta.id }" />
                  </div>
                  <div v-else>
                    <q-btn outline color="primary" size="11px" icon="send" :to="{ path: '/job/workload/' + props.row.meta.id }" />
                  </div>
                </div>
                <div>
                  <div v-if="historyType === 'history'">
                    <q-btn outline color="orange-8" size="11px" icon="tune" :to="{ path: '/messages/edit/' + props.row.meta.id }" />
                  </div>
                  <div v-else>
                    <q-btn outline color="orange-8" size="11px" icon="tune" :to="{ path: '/messages/primer/' + props.row.meta.id }" />
                  </div>
                </div>
                <div>
                  <q-btn outline color="red" size="11px" icon="close" @click="deleteJob(props.row.meta.id)" />
                </div>
              </div>
              <div v-else-if="row.name === 'id'">
                {{ row.value }}
              </div>
              <div v-else-if="row.name === 'status'">
                <q-chip size="10px" color="green" text-color="white"> {{ $t('completed') }} </q-chip>
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

      <div v-if="table2 !== false" class="q-mt-lg">
        <lili-title :title="$t('lili_workloads')" :desc="$t('lili_workloads_desc')" />
        <q-table :rows="table2" :pagination="pagination" :columns="columns" row-key="id" flat bordered separator="cell">
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td :props="props" v-for="row in props.cols" :key="row.name">
                <div class="row items-center justify-center q-col-gutter-sm" style="min-width: 180px" v-if="row.name === 'actions'">
                  <div>
                    <q-btn outline color="primary" size="11px" icon="send" :to="{ path: '/job/workload/' + props.row.meta.id }" />
                  </div>
                  <div>
                    <q-btn outline color="orange-8" size="11px" icon="receipt" :to="{ path: '/messages/primer/' + props.row.meta.id }" />
                  </div>
                  <div>
                    <q-btn outline color="red" disable size="11px" icon="close" @click="deleteJob(props.row.meta.id)" />
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
      historyType: this.$route.params.historyType || 'history',
      displayOutput: false,
      markdown: ' # hello world \n ```js\n function hello(){ console.log(Hello World) } \n```',
      table2: false,
      pagination: {
        rowsPerPage: 15,
        sortBy: 'id',
        descending: true,
      },
    };
  },
  computed: {
    ...mapStores(useJobStore, useSettingsStore),
    lockedPageClass() {
      return this.settingsStore.isValidKey ? '' : 'locked-page';
    },
    pageTitle() {
      if (this.$route.params.historyType === 'history') {
        return this.$t('history');
      } else {
        return this.$t('your_workloads');
      }
    },
    pageDesc() {
      if (this.$route.params.historyType === 'history') {
        return this.$t('history_desc');
      } else {
        return this.$t('workload_desc');
      }
    },
    columns() {
      let cols = [
        { name: 'actions', label: this.$t('actions'), field: 'actions', align: 'center', sortable: false, headerClasses: 'q-table--col-auto-width' },
      ];

      if (this.$route.params.historyType === 'history') {
        cols.push({
          name: 'id',
          label: this.$t('id'),
          field: (r) => r.meta.id,
          align: 'left',
          sortable: true,
          headerClasses: 'q-table--col-auto-width',
        });
        cols.push({ name: 'prompt', label: this.$t('prompt'), field: (r) => r.workloadOptions.prompt, align: 'left', sortable: true });
        cols.push({
          name: 'workload',
          label: this.$t('workload'),
          field: (r) => r.workloadDefinition.name,
          align: 'left',
          sortable: true,
          headerClasses: 'q-table--col-auto-width',
        });
        cols.push({
          name: 'status',
          label: this.$t('status'),
          field: 'status',
          align: 'left',
          sortable: true,
          headerClasses: 'q-table--col-auto-width',
        });
      } else {
        cols.push({
          name: 'name',
          label: this.$t('name'),
          field: (r) => r.workloadDefinition.name,
          align: 'left',
          sortable: true,
          headerClasses: 'q-table--col-auto-width',
        });
        cols.push({
          name: 'description',
          label: this.$t('description'),
          field: (r) => r.workloadDefinition.description,
          align: 'left',
          sortable: true,
        });
        cols.push({
          name: 'codename',
          label: this.$t('codename'),
          field: (r) => r.workloadDefinition.codename,
          align: 'left',
          sortable: true,
          headerClasses: 'q-table--col-auto-width',
        });
      }

      return cols;
    },
  },
  methods: {
    async load() {
      this.table2 = false;
      this.jobStore.empty();

      if (this.$route.params.historyType === 'user') this.table2 = await this.jobStore.getHistory(0, 100, 'core');
      this.jobStore.getHistory(0, 100, this.$route.params.historyType);
    },
    viewJob(jobId) {
      this.$router.push({ path: '/jobs/' + jobId });
    },
    deleteJob(jobId) {
      console.log('Del jobo', jobId);
      this.jobStore.deleteJob(jobId, this.$route.params.historyType);
    },
  },
  beforeMount() {
    this.load();
  },
  watch: {
    '$route.params.historyType'() {
      this.load();
    },
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