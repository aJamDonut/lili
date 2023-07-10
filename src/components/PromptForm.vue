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

      <div v-if="!showAdvanced" class="row justify-center q-mb-lg">
        <div><q-btn outline @click="showAdvanced = !showAdvanced" color="grey" label="Advanced Settings" size="10px" /></div>
      </div>

    <transition name="slidedown">
      <lili-cont v-if="showAdvanced" :title="true" class="q-mb-lg">
        <template v-slot:title>
          <div class="row items-center">
            <div class="col">Advanced</div>
            <div class="col-shrink" style="cursor: pointer;" @click="showAdvanced = !showAdvanced">
              <q-icon name="close" color="red-6" size="16px" />
            </div>
          </div>
        </template>
          <div class="row q-col-gutter-md">
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
            <!-- Output -->
            <div class="col-sm-6 col-xs-12">
              <label>Output Format</label>
              <q-select
                v-model="promptConfig.outputFormat"
                filled
                :options="outputFormatOptions"
                dense
              ></q-select>
            </div>
            <div class="col-sm-6 col-xs-12">
              <label>Output To</label>
              <q-select
                v-model="promptConfig.outputTo"
                filled
                :options="outputToOptions"
                dense
              ></q-select>
            </div>
            <!-- Extra Stuff -->
            <div class="col-sm-3 col-xs-6">
              <label>Creativity</label>
              <q-input
                v-model="promptConfig.creativity"
                filled
                type="number"
                step="0.01"
                min="0.5"
                max="1"
                dense
              ></q-input>
            </div>
            <div class="col-sm-3 col-xs-6">
              <label>Repetitiveness</label>
              <q-input
                v-model="promptConfig.repetitiveness"
                filled
                type="number"
                step="0.01"
                min="0.5"
                max="1"
                dense
              ></q-input>
            </div>
            <div class="col-sm-3 col-xs-6">
              <label>Response Limit</label>
              <q-input
                v-model="promptConfig.responseLimit"
                filled
                type="number"
                min="0"
                :max="32000"
                dense
              ></q-input>
            </div>
            <div class="col-sm-3 col-xs-6">
              <label>Solution Count</label>
              <q-input
                v-model="promptConfig.solutionCount"
                filled
                type="number"
                min="1"
                max="5"
                dense
              ></q-input>
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
  computed: {
    promptConfig: {
      get () { return this.modelValue },
      set (value) { this.$emit('update:modelValue', value) }
    }
  }
};
</script>

