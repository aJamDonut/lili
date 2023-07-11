<template>
  <div class="q-py-md">
    <label>Prompt</label>
    <q-input
      v-model="promptConfig.prompt"
      filled
      type="textarea"
      rows="3"
      autogrow
      dense
      class="q-mb-md"
    ></q-input>

    <label>Workload</label>
    <q-select
      v-model="promptConfig.workload"
      filled
      :options="workloadOptions"
      dense
      class="q-mb-md"
    ></q-select>

    <transition name="slidedown" mode="out-in">
      <div v-if="!showAdvanced" class="row justify-center q-mb-lg" key="adv-btn">
        <div><q-btn outline @click="showAdvanced = !showAdvanced" color="grey" label="Advanced Settings" size="10px" /></div>
      </div>
      <lili-cont v-else :title="true" class="q-mb-lg" key="adv-cont">
        <template v-slot:title>
          <div class="row items-center">
            <div class="col">Advanced</div>
            <div class="col-shrink" style="cursor: pointer;" @click="showAdvanced = !showAdvanced">
              <q-icon name="close" color="red-6" size="16px" />
            </div>
          </div>
        </template>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-xs-12">
              <label>Context</label>
              <q-input
                v-model="promptConfig.context"
                filled
                type="textarea"
                rows="3"
                autogrow
                dense
              ></q-input>
            </div>
          </div>
          <div class="row q-col-gutter-md q-mb-md">
            <!-- Output -->
            <div class="col" style="min-width: 120px;">
              <label>Output Format</label>
              <q-select
                v-model="promptConfig.outputFormat"
                filled
                :options="outputFormatOptions"
                dense
              ></q-select>
            </div>
            <div class="col" style="min-width: 120px;">
              <label>Output To</label>
              <q-select
                v-model="promptConfig.outputTo"
                filled
                :options="outputToOptions"
                dense
              ></q-select>
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <!-- Extra Stuff -->
            <div class="col" style="min-width: 120px;">
              <label>Creativity</label>
              <lili-slider v-model="promptConfig.creativity" :step="0.01" :min="0.5" :max="1" />
            </div>
            <div class="col" style="min-width: 120px;">
              <label>Repetitiveness</label>
              <lili-slider v-model="promptConfig.repetitiveness" :step="0.01" :min="0.5" :max="1" />
            </div>
            <div class="col" style="min-width: 120px;">
              <label>Response Limit</label>
              <lili-slider v-model="promptConfig.responseLimit" :step="2000" :min="0" :max="32000" />
            </div>
            <div class="col" style="min-width: 120px;">
              <label>Solution Count</label>
              <lili-slider v-model="promptConfig.solutionCount" :step="1" :min="1" :max="10" />
            </div>
          </div>
      </lili-cont>
    </transition>
    <div class="row justify-end">
      <div>
        <q-btn
          @click="runJob"
          color="green"
          icon="play_arrow"
          label="Run Job"
          :loading="jobRunning"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showAdvanced: false,
      workloadOptions: ['New', 'Edit'],
      outputFormatOptions: ['Plaintext', 'Chat', 'HTML'],
      outputToOptions: ['Inline', 'Cursor', 'Folder'],
    };
  },
  props: {
    modelValue: null,
  },
  methods: {
    runJob() {
      this.$emit('run');
    }
  },
  computed: {
    promptConfig: {
      get () { return this.modelValue },
      set (value) { this.$emit('update:modelValue', value) }
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