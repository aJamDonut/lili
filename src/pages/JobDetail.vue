<template>
  <q-page padding class="job-detail">
    <div>
      <div v-if="type === 'edit'">
        <q-btn
          dense
          flat
          size="sm"
          :label="$t('workloads')"
          text-color="grey-5"
          icon="arrow_back"
          :to="{ path: '/history/history' }"
          class="q-py-sm q-pr-sm q-mb-sm"
        />
      </div>
      <div v-if="type === 'primer' || type === 'new'">
        <q-btn
          dense
          flat
          size="sm"
          :label="$t('workloads')"
          text-color="grey-5"
          icon="arrow_back"
          :to="{ path: '/history/user' }"
          class="q-py-sm q-pr-sm q-mb-sm"
        />
      </div>
      <div class="row q-mb-md">
        <q-space />
        <div v-if="type === 'primer'">
          <q-btn flat dense icon="save" title="Save" @click="saveHistoricWorkload()" />
          <q-btn flat dense icon="content_copy" title="Create copy" @click="copyHistoricWorkload()" />
          <q-btn icon="send" :to="{ path: '/job/workload/' + job.definition.meta.id }" />
        </div>
        <div v-if="type === 'edit'">
          <q-btn flat dense icon="save" title="Save" @click="saveHistoricWorkload()" />
          <q-btn flat dense icon="content_copy" title="Create copy" @click="copyHistoricWorkload()" />
          <q-btn flat dense icon="psychology" title="Create primer" @click="copyHistoricWorkloadAsPrimer()" />
        </div>
        <div v-if="type === 'new'">
          <q-btn flat dense icon="save" title="Create" @click="copyHistoricWorkloadAsPrimer()">{{ $t('create') }}</q-btn>
        </div>
      </div>

      <lili-cont :title="$t('workload')">
        <div class="text-subtitle1" v-if="job.definition.meta.id">{{ job.definition.meta.id }}</div>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-xs-12">
            <label>{{ $t('name') }}</label>
            <q-input v-model="job.definition.workloadDefinition.name" filled type="textarea" rows="3" autogrow dense></q-input>
          </div>
          <div class="col-xs-12">
            <label>{{ $t('description') }}</label>
            <q-input v-model="job.definition.workloadDefinition.description" filled type="textarea" rows="3" autogrow dense></q-input>
          </div>
          <div v-if="cli" class="col-xs-12">
            <label>{{ $t('command') }}</label>
            <q-input v-model="cli" filled type="textarea" rows="3" autogrow dense></q-input>
          </div>
        </div>
      </lili-cont>
      <br />
      <lili-cont :title="$t('history')" class="q-mb-sm">
        <drop-list :items="job.history" @reorder="$event.apply(job.history)" mode="cut">
          <template v-slot:item="{ item, index, reorder }">
            <drag :key="index" :data="item" handle=".drag-handle">
              <div :class="dragClass(reorder)">
                <div class="col-shrink">
                  <q-icon color="grey-6" size="20px" name="drag_indicator" class="drag-handle q-mt-sm" />
                </div>
                <div class="col-2">
                  <q-select v-model="item.role" filled :options="roleOptions" dense></q-select>
                </div>
                <div class="col">
                  <q-input
                    v-model="item.content"
                    filled
                    rows="2"
                    :autogrow="this.autoGrow[index]"
                    @focus="this.autoGrow[index] = true"
                    @blur="onBlur(index)"
                    dense
                  ></q-input>
                </div>
                <div class="col-shrink">
                  <q-btn flat dense color="red" icon="close" class="q-mt-xs" @click="deleteMessage(index)" />
                </div>
              </div>
            </drag>
          </template>
          <template v-slot:feedback="{ data }">
            {{ data.title }}
          </template>
        </drop-list>

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
import { Drag, DropList } from 'vue-easy-dnd';
import 'vue-easy-dnd/dist/dnd.css';
import { saveHistoricWorkload } from '../services/lili/lili_real';
import { information } from '../boot/lili';

function getBlankJob() {
  return {
    definition: {
      meta: { id: false, isPrimer: true },
      workloadDefinition: {
        name: 'no_name',
        codename: 'blank',
        description: 'No description',
        category: 'general',
        context: ['extract_files'],
        defaults: { advanced: { repetitiveness: 1.5, creativity: 0, tokenLength: 15000, solutionCount: 1 } },
        messageHistory: [],
      },
      workloadOptions: {},
    },
    history: [{ role: 'system', content: 'Take on the role of a teacher helping the user to learn...' }],
  };
}

export default {
  data() {
    return {
      type: this.$route.params.type || 'new',
      job: getBlankJob(),
      roleOptions: [
        { label: 'user', value: 'user' },
        { label: 'lili', value: 'lili' },
        { label: 'assistant', value: 'assistant' },
        { label: 'system', value: 'system' },
      ],
      count: 0,
      autoGrow: {},
    };
  },
  components: {
    Drag,
    DropList,
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
    cli() {
      if (!this.job || !this.job.definition || !this.job.definition.meta || !this.job.definition.meta.id) {
        return false;
      }
      const id = this.job.definition.meta.id;
      return `liliflux.exe --cli --action=RunWorkload --workload=${id} --prompt="<Your prompt>"`;
    },
  },
  methods: {
    onBlur(index) {
      this.count++;
      if (this.count > 1) {
        this.autoGrow[index] = false;
        this.count = 0;
      }
    },
    dragClass(reorder) {
      let classes = ['row items-start q-col-gutter-sm q-mb-sm'];
      if (reorder) {
        classes.push('dragging');
      }
      return classes;
    },
    deleteJob(jobId) {
      this.jobStore.deleteJob(jobId);
    },
    autoGrowEnabled(index) {
      if (this.autoGrow[index] === true) {
        return true;
      }
      return false;
    },
    deleteMessage(index) {
      //TODO: set to hidden...
      this.job.history.splice(index, 1);
    },
    downloadJob(jobId) {
      const jobInfo = this.jobStore.loadJobDetail(jobId);
      // Download logic here
    },
    //TODO: move to job store right?
    async saveHistoricWorkload() {
      await saveHistoricWorkload(JSON.parse(JSON.stringify(this.job)));

      information('Successfully saved!');
    },
    async copyHistoricWorkload() {
      const historyCopy = JSON.parse(JSON.stringify(this.job));
      historyCopy.definition.meta.id = false;
      let newJobId = await saveHistoricWorkload(historyCopy); //Use save but kill off the ID to make a copy
      this.$router.push({ path: '/messages/edit/' + newJobId });
      this.job = await this.jobStore.loadJobDetail(newJobId);
      information('Now working on the copy!');
    },
    async copyHistoricWorkloadAsPrimer() {
      const historyCopy = JSON.parse(JSON.stringify(this.job));
      console.log('COPY', historyCopy);
      historyCopy.definition.meta.isPrimer = true;
      historyCopy.definition.meta.id = false;
      let newJobId = await saveHistoricWorkload(historyCopy); //Use save but kill off the ID to make a copy
      this.$router.push({ path: '/messages/primer/' + newJobId });
      this.job = await this.jobStore.loadJobDetail(newJobId);
      information('Now working on the copy!');
    },
  },
  async beforeMount() {
    if (this.$route.params.type === 'new' || !this.$route.params.id) {
      this.job = getBlankJob();
      return;
    }
    this.job = await this.jobStore.loadJobDetail(this.$route.params.id);
  },
  watch: {
    '$route.params.type'() {
      this.type = this.$route.params.type || 'new';
    },
    async '$route.params.id'() {
      if (this.$route.params.type === 'new' || !this.$route.params.id) {
        this.job = getBlankJob();
        return;
      }
      this.job = await this.jobStore.loadJobDetail(this.$route.params.id);
    },
  },
};
</script>

<style lang="scss" scoped>
.job-detail {
  .dragging {
    background-color: $primary;
    color: white;
  }
  .drag-handle {
    cursor: move;
    cursor: grab;
  }
}
</style>