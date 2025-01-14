<template>
  <div>
    <!-- <label>{{ $t('prompt') }}</label> -->
    <q-input
      v-model="promptConfig.prompt"
      filled
      :placeholder="$t('enter_prompt')"
      type="textarea"
      rows="3"
      autogrow
      dense
      class="q-mb-md"
      @keyup.ctrl.enter="runJob"
    >
      <template v-slot:append>
        <q-btn @click="runJob" unelevated size="10px" de color="green" icon="send" />
      </template>
    </q-input>

    <div class="row justify-end" key="adv-btn">
      <div>
        <q-btn dense unelevated class="workload-btn" size="12px" @click="settingsStore.showAdvanced = !settingsStore.showAdvanced">
          <div class="row items-end">
            <div class="col-shrink">
              <q-icon name="psychology" />
            </div>
            <div class="col q-ml-sm q-mr-xs">
              {{ promptConfig.workload.label }}
            </div>
            <div class="col-shrink">
              <q-icon :name="showAdvancedIcon" />
            </div>
          </div>
        </q-btn>
      </div>
    </div>
    <transition name="slidedown">
      <div v-if="settingsStore.showAdvanced">
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-xs-12">
            <label>{{ $t('workload') }}</label>
            <q-select v-model="promptConfig.workload" filled :options="workloadOptions" dense></q-select>
          </div>
        </div>
        <div class="row q-col-gutter-md q-mb-md">
          <!-- <div class="col-xs-12">
            <label>{{ $t('context') }}</label>
            <q-input v-model="promptConfig.context" filled type="textarea" rows="3" autogrow dense></q-input>
          </div> -->
        </div>
        <div class="row q-col-gutter-md">
          <!-- Extra Stuff -->
          <div class="col" style="min-width: 120px">
            <label>{{ !settingsStore.show_nice_params ? 'temperature' : $t('randomness') }}</label>
            <lili-slider v-model="promptConfig.temperature" :step="0.05" :min="0" :max="2" />
          </div>
          <div class="col" style="min-width: 120px">
            <label>{{ !settingsStore.show_nice_params ? 'top_p' : $t('creativity') }}</label>
            <lili-slider v-model="promptConfig.top_p" :step="0.05" :min="0" :max="1" />
          </div>
          <div class="col" style="min-width: 120px">
            <label>{{ !settingsStore.show_nice_params ? 'frequency_penalty' : $t('repetitiveness') }}</label>
            <lili-slider v-model="promptConfig.frequency_penalty" :step="0.05" :min="-2" :max="2" />
          </div>
          <div class="col" style="min-width: 120px">
            <label>{{ !settingsStore.show_nice_params ? 'max_tokens' : $t('response_limit') }}</label>
            <lili-slider v-model="promptConfig.max_tokens" :step="2000" :min="0" :max="32000" />
          </div>
          <!--<div class="col" style="min-width: 120px">
            <label>{{ $t('solution_count') }}</label>
            <lili-slider v-model="promptConfig.solutionCount" :step="1" :min="1" :max="10" />
          </div>-->
        </div>
        <br />
        <label>{{ $t('workspace_folder') }}</label>
        <div>
          <q-input readonly filled v-model="workspaceFolder" rows="3" type="text" class="q-mb-md">
            <template v-slot:append>
              <q-btn @click="changeWorkspace" round dense flat icon="drive_file_move" />
              <q-btn @click="openWorkspace" round dense flat icon="visibility" />
            </template>
          </q-input>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useSettingsStore } from 'stores/settings';
import { useWorkloadStore } from 'stores/workload';
import { getWorkspaceDir, changeWorkspace, showFolder } from '../services/lili/lili_real';
import { reactiveProps } from '../utils/reactiveProps';

async function mountWorkloads() {
  this.workloadOptions = [];
  await this.workloadStore.refresh();
  console.log('REFRESH', this.jobId);
  for (const item of this.workloadStore.workloads) {
    this.workloadOptions.push({
      label: item.workloadDefinition.name,
      value: item.meta.id,
    });

    if (item.meta.id === this.jobId) {
      this.settingsStore.workload = {
        label: item.workloadDefinition.name,
        value: item.meta.id,
      };
    }
  }
  console.log('set workload', this.settingsStore.workload);
  this.promptConfig.workload = this.settingsStore.workload;
}

export default {
  data() {
    return {
      workspaceFolder: 'UserData',
      workloadOptions: [],
    };
  },
  props: {
    jobId: String,
    modelValue: null,
  },
  methods: {
    async changeWorkspace() {
      this.workspaceFolder = await changeWorkspace();
    },
    openWorkspace() {
      console.log('Show', this.workspaceFolder);
      showFolder(this.workspaceFolder);
    },
    runJob() {
      console.log('run Job');
      this.$emit('run');
    },
  },
  async mounted() {
    this.workspaceFolder = await getWorkspaceDir();

    mountWorkloads.call(this);
  },
  computed: {
    ...mapStores(useWorkloadStore, useSettingsStore),
    showAdvancedIcon() {
      return this.settingsStore.showAdvanced ? 'expand_less' : 'expand_more';
    },
    promptConfig: {
      get() {
        return this.modelValue;
      },
      set(value) {
        //vuejs is a piece of shit.
        // Not working
        // this.settingsStore.workload = value.workload;
        // console.log('set workload to', value.workload)
        this.$emit('update:modelValue', value);
      },
    },
  },
  watch: {
    $props: reactiveProps(() => {
      mountWorkloads.call(this);
    }),
    'promptConfig.workload': function (val) {
      this.settingsStore.workload = val;
    },
  },
};
</script>

<style lang="scss" scoped>
.slidedown-enter-active,
.slidedown-leave-active {
  transition: max-height 0.5s ease-in-out;
}

.slidedown-enter-to,
.slidedown-leave-from {
  overflow: hidden;
  max-height: 1000px;
}

.slidedown-enter-from,
.slidedown-leave-to {
  overflow: hidden;
  max-height: 0;
}
</style>