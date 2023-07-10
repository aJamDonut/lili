<template>
  <q-page>
    <q-splitter v-model="splitterModel" style="min-height: inherit;">
      <template v-slot:before>
        <div class="q-pa-md">
          <prompt-form v-model="promptConfig" @run="runJob" />
        </div>
      </template>

      <template v-slot:separator>
        <q-icon color="grey-5" text-color="white" size="18px" name="drag_indicator" />
      </template>

      <template v-slot:after>
        <div class="q-pa-md">
          <display-output v-if="showOutput" v-model="outputText" />
        </div>
      </template>

    </q-splitter>
  </q-page>
</template>


<script>
import { startWorkload } from '../services/lili';
export default {
  data() {
    return {
      promptConfig: {
        prompt: '',
        context: '',
        workload: 'New',
        outputFormat: 'Plaintext',
        outputTo: 'Inline',
        creativity: 0.5,
        repetitiveness: 0.5,
        responseLimit: 16000,
        solutionCount: 1,
      },
      splitterModel: 100,
      outputText: ''
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

      startWorkload({
        forEachToken: this.processToken,
        onComplete: () => {
          this.jobRunning = false;
        },
      });
    }
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