<template>
  <q-page padding>
    <div class="feature-page">
    <q-table
      :rows="jobStore.jobHistory"
      :columns="columns"
      row-key="id"
      flat
      bordered
      separator="cell"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td :props="props" v-for="row in props.cols" :key="row.name">
            <div v-if="row.name === 'id'">
              {{ row.value }}
            </div>
            <div v-else-if="row.name === 'status'">
              <q-chip size="10px" color="green" text-color="white">
                COMPLETED
              </q-chip>
            </div>
            <div class="row items-center justify-center q-col-gutter-sm" v-else-if="row.name === 'actions'">
              <div>
              <q-btn
                color="primary"
                label="View"
                outline
                size="sm"
                @click="viewJob(props.row.id)"
              />
              </div>
              <div>
              <q-btn
                color="red"
                outline
                size="11px"
                icon="close"
                dense
                @click="deleteJob(props.row.id)"
              />
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
    <div class="overlay flex flex-center">
      <div class="row items-end q-col-gutter-xs">
        <div><q-icon name="sym_o_info" size="20px" /></div>
        <div>Validate your license key to unlock all features</div>
      </div>
    </div>
  </q-page>
</template>


<script>
import { mapStores } from 'pinia'
import { useJobStore } from 'stores/job';

export default {
  data() {
    return {
      displayOutput: false,
      markdown: " # hello world \n ```js\n function hello(){ console.log(Hello World) } \n```",
    };
  },
  computed: {
    columns () {
      return [
        { name: 'id', label: this.$t('id'), field: 'id', align: 'left', sortable: true },
        { name: 'prompt', label: this.$t('prompt'), field: 'prompt', align: 'left', sortable: true },
        { name: 'context', label: this.$t('context'), field: 'context', align: 'left', sortable: true },
        { name: 'first_workload', label: this.$t('first_workload'), field: 'first_workload', align: 'left', sortable: true },
        { name: 'last_workload', label: this.$t('last_workload'), field: 'last_workload', align: 'left', sortable: true },
        { name: 'response', label: this.$t('response'), field: 'response', align: 'left', sortable: true },
        { name: 'status', label: this.$t('status'), field: 'status', align: 'left', sortable: true },
        { name: 'actions', label: this.$t('actions'), field: 'actions', align: 'center', sortable: false },
      ]
    },
    ...mapStores(useJobStore)
  },
  methods: {
    viewJob(jobId) {
      this.$router.push({ path: '/jobs/' + jobId });
    },
    deleteJob(jobId) {
      this.jobStore.deleteJob(jobId);
    }
  },
  beforeMount () {
    this.jobStore.getHistory();
  }
};
</script>

<style lang="scss" scoped>
textarea{
  width: 100%;
  height: 200px;
}
</style>