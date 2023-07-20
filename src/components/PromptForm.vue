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
            <q-select
              v-model="promptConfig.workload"
              filled
              :options="workloadOptions"
              dense
            ></q-select>
          </div>
        </div>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-xs-12">
            <label>{{ $t('context') }}</label>
            <q-input v-model="promptConfig.context" filled type="textarea" rows="3" autogrow dense></q-input>
          </div>
        </div>
        <div class="row q-col-gutter-md">
          <!-- Extra Stuff -->
          <div class="col" style="min-width: 120px">
            <label>{{ $t('creativity') }}</label>
            <lili-slider v-model="promptConfig.creativity" :step="0.01" :min="0.5" :max="1" />
          </div>
          <div class="col" style="min-width: 120px">
            <label>{{ $t('repetitiveness') }}</label>
            <lili-slider v-model="promptConfig.repetitiveness" :step="0.01" :min="0.5" :max="1" />
          </div>
          <div class="col" style="min-width: 120px">
            <label>{{ $t('response_limit') }}</label>
            <lili-slider v-model="promptConfig.responseLimit" :step="2000" :min="0" :max="32000" />
          </div>
          <div class="col" style="min-width: 120px">
            <label>{{ $t('solution_count') }}</label>
            <lili-slider v-model="promptConfig.solutionCount" :step="1" :min="1" :max="10" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useSettingsStore } from 'stores/settings';
import { useWorkloadStore } from 'stores/workload';

function mountWorkloads() {
  this.workloadOptions = [];
  for (const item of this.workloadStore.workloads) {
    this.workloadOptions.push({
      label: item.name,
      value: item.codename,
    });
  }
}

export default {
  data() {
    return {
      workloadOptions: []
    };
  },
  props: {
    modelValue: null,
  },
  methods: {
    runJob() {
      this.$emit('run');
    },
  },
  mounted() {
    mountWorkloads.call(this);
  },
  beforeMount () {
    console.log('before mount', this.settingsStore.workload)
    this.promptConfig.workload = this.settingsStore.workload
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
        // Not working
        // this.settingsStore.workload = value.workload;
        // console.log('set workload to', value.workload)
        this.$emit('update:modelValue', value);
      }
    },
  },
  watch: {
    'promptConfig.workload': function (val) {
      this.settingsStore.workload = val
    }
  }
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