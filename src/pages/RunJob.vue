<template>
  <q-page padding>
    <div class="row items-center">
      <div class="col">
        <h1 class="text-h5">Run Job</h1>
      </div>
      <div class="col-shrink">
        <q-btn @click="showAdvanced = !showAdvanced" outline color="primary"
          >Toggle Advanced</q-btn
        >
      </div>
    </div>

    <div class="q-py-md">
      <label>Prompt</label>
      <q-input
        v-model="prompt"
        filled
        type="textarea"
        rows="3"
        autogrow
        dense
        class="q-mb-md"
      ></q-input>

      <label>Workload</label>
      <q-select
        v-model="workload"
        filled
        :options="workloadOptions"
        dense
        class="q-mb-lg"
      ></q-select>

      <transition name="slidedown">
        <lili-cont title="Advanced" class="q-mb-lg" v-if="showAdvanced">
          <div class="row q-col-gutter-md">
            <div class="col-xs-12">
              <label>Context</label>
              <q-input
                v-model="context"
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
                v-model="outputFormat"
                filled
                :options="outputFormatOptions"
                dense
              ></q-select>
            </div>
            <div class="col-sm-6 col-xs-12">
              <label>Output To</label>
              <q-select
                v-model="outputTo"
                filled
                :options="outputToOptions"
                dense
              ></q-select>
            </div>
            <!-- Extra Stuff -->
            <div class="col-sm-3 col-xs-6">
              <label>Creativity</label>
              <q-input
                v-model="creativity"
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
                v-model="repetitiveness"
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
                v-model="responseLimit"
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
                v-model="solutionCount"
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
    <display-output v-if="showOutput" v-model="outputText" />
  </q-page>
</template>


<script>
import { startWorkload } from '../services/lili';
export default {
  data() {
    return {
      outputText: '',
      showAdvanced: false,
      prompt: '',
      context: '',
      workload: 'New',
      outputFormat: 'Plaintext',
      outputTo: 'Inline',
      creativity: 0.5,
      repetitiveness: 0.5,
      responseLimit: 16000,
      solutionCount: 1,
      workloadOptions: ['New', 'Edit'],
      outputFormatOptions: ['Plaintext', 'Chat', 'HTML'],
      outputToOptions: ['Inline', 'Cursor', 'Folder'],
    };
  },
  computed: {
    showOutput() {
      return this.outputText.length > 0;
    }
  },
  methods: {
    toggleDisplayOutput() {
      this.displayOutput = !this.displayOutput;
    },
    processToken(token) {
      this.outputText = this.outputText + token;
      console.log(token);
    },
    runJob() {
      if (this.jobRunning) return;
      this.jobRunning = true;
      this.outputText = '';
      console.log('Runo');
      startWorkload({
        forEachToken: this.processToken,
        onComplete: () => {
          this.jobRunning = false;
        },
      });
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