<template>
  <q-page>
    <q-splitter
      v-model="splitterWidth"
      :limits="[25, 60]"
      style="min-height: inherit"
      before-class="bg-dark-1"
      class="absolute-full"
    >
      <template v-slot:before>
        <q-scroll-area class="fit" :thumb-style="thumbStyle" :bar-style="barStyle" style="min-height: 100%">
          <div class="q-pa-md" style="min-height: 100%">
            <prompt-form v-model="promptConfig" @run="runJob" />
          </div>
        </q-scroll-area>
      </template>

      <!-- <template v-slot:separator>
        <q-icon
          color="grey-5"
          text-color="white"
          size="18px"
          name="drag_indicator"
        />
      </template> -->

      <template v-slot:after>
        <q-scroll-area
          :visible="true"
          :thumb-style="thumbStyle"
          :bar-style="barStyle"
          class="fit"
          style="min-height: 100%"
        >
          <div class="q-pa-md" style="min-height: 100%">
            <display-prompt class="q-mb-md" v-model="promptConfig" />
            <display-output v-if="outputJson.length > 1" v-model="outputJson" />
            <display-output v-model="outputText" />
          </div>
        </q-scroll-area>
      </template>
    </q-splitter>
  </q-page>
</template>

<script>
import { startWorkload } from 'services/lili/lili_real';
import { mapStores } from 'pinia';
import { useSettingsStore } from 'stores/settings';
/**
 Please update fred.json to make sure that it contains all the references that exist in freds_record.csv under the appropriate headers 
 */

function logMessage(log) {
  return `<li>${log.content}... (${log.state})</li>`;
}
export default {
  data() {
    return {
      promptConfig: {
        prompt: 'Please take file1.csv and merge it with file2.csv into file3.csv',
        context: '',
        workload: { label: 'Change files', value: 'change_files' },
        outputFormat: 'Plaintext',
        outputTo: 'Inline',
        creativity: 0.5,
        repetitiveness: 0.5,
        responseLimit: 16000,
        solutionCount: 1,
      },
      thumbStyle: {
        right: '3px',
        borderRadius: '5px',
        // backgroundColor: '#027be3',
        width: '7px',
        // opacity: 0.75
      },
      barStyle: {
        // right: '2px',
        // borderRadius: '9px',
        // backgroundColor: '#027be3',
        // width: '9px',
        // opacity: 0.2
      },
      outputText: '',
      outputJson: '',
    };
  },
  computed: {
    ...mapStores(useSettingsStore),
    splitterWidth: {
      get() {
        return this.settingsStore.splitterWidth;
      },
      set(value) {
        this.settingsStore.splitterWidth = value;
      },
    },
  },
  methods: {
    processToken(token) {
      this.outputText = this.outputText + token;
      console.log(token);
    },
    runJob() {
      // if (this.jobRunning) return;
      // this.jobRunning = true;
      this.outputText = '';

      startWorkload({
        prompt: this.promptConfig.prompt,
        workload: this.promptConfig.workload.value,
        forEachToken: this.processToken,
        onComplete: () => {
          // this.jobRunning = false;
        },
        onJsonResponse: (json) => {
          this.outputJson = this.outputJson + logMessage(json);
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