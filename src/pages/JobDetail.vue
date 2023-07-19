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
        <drop-list :items="job.history" @reorder="$event.apply(job.history)" mode="cut">
            <template v-slot:item="{item, index, reorder}">
              <drag :key="index" :data="item" handle=".drag-handle">
                <div :class="dragClass(reorder)">
                  <div class="col-shrink">
                      <q-icon color="grey-6" size="20px" name="drag_indicator" class="drag-handle q-mt-sm" />
                  </div>
                  <div class="col-2">
                    <q-select v-model="item.role" filled :options="roleOptions" dense></q-select>
                  </div>
                  <div class="col">
                    <q-input v-model="item.content" filled rows="2" :autogrow="this.autoGrow[index]" @focus="this.autoGrow[index] = true;" @blur="onBlur(index)" dense></q-input>
                  </div>
                  <div class="col-shrink">
                    <q-btn flat dense color="red" icon="close" class="q-mt-xs" @click="deleteMessage(index)" />
                  </div>
                </div>
              </drag>
            </template>
            <template v-slot:feedback="{data}">
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
import { Drag, DropList } from "vue-easy-dnd";
import 'vue-easy-dnd/dist/dnd.css'

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
  components: {
    Drag,
    DropList
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
    dragClass( reorder ) {
      let classes = ['row items-start q-col-gutter-sm q-mb-sm']
      if (reorder) {
        classes.push('dragging')
      }
      return classes
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