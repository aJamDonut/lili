<template>
  <q-page>
    <div :class="lockedPageClass">
    <q-splitter
      v-model="splitterWidth"
      :limits="[25, 60]"
      style="min-height: inherit"
      before-class="panel-left-bg"
      after-class="panel-right-bg"
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
            <!-- Historic Transactions -->
            <div v-for="(row, index) in transactions" :key="index" class="ai_transaction q-mb-sm">
              <display-prompt class="q-mb-xs" v-model="row.promptConfig" />
              <lili-cont v-if="row.outputJson.length > 1" class="q-mb-xs" title="Inline Output">
                <inline-output v-for="(output, index) in row.outputJson" :key="index" :json="output" />
              </lili-cont>
              <!-- <display-output class="q-mb-md" v-if="outputJson.length > 1" v-model="outputJson" /> -->
              <display-output v-model="row.outputText" />
              <q-separator class="q-my-md" />
            </div>

            <!-- Active Transaction -->
            <div v-if="transactionRunning" class="ai_transaction">
              <display-prompt class="q-mb-md" v-model="promptConfig" />
              <lili-cont v-if="outputJson.length > 1" title="Inline Output">
                <inline-output v-for="(output, index) in outputJson" :key="index" :json="output" />
              </lili-cont>
              <!-- <display-output class="q-mb-md" v-if="outputJson.length > 1" v-model="outputJson" /> -->
              <display-output v-model="outputText" />
            </div>

          </div>
        </q-scroll-area>
      </template>
    </q-splitter>
    </div>
    <locked-overlay />
  </q-page>
</template>

<script>
import { startWorkload } from 'services/lili/lili_real';
import { mapStores } from 'pinia';
import { useSettingsStore } from 'stores/settings';
/**
 Please update fred.json to make sure that it contains all the references that exist in freds_record.csv under the appropriate headers 
 */

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
      transactionRunning: false,
      transactions: [],
      outputText: '',
      outputJson: [],
    };
  },
  computed: {
    ...mapStores(useSettingsStore),
    lockedPageClass () {
      return this.settingsStore.isValidKey ? '' : 'locked-page';
    },
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
    parseJson(json) {
      this.outputJson.push(json)
    },
    storeTransaction() {
      this.transactions.push({
        promptConfig: this.promptConfig,
        outputText: this.outputText,
        outputJson: this.outputJson,
      })
      this.outputText = '';
      this.outputJson = [];
    },
    runJob() {
      if (this.transactionRunning) return;
      this.transactionRunning = true;
      this.outputText = '';

      startWorkload({
        prompt: this.promptConfig.prompt,
        workload: this.promptConfig.workload.value,
        forEachToken: this.processToken,
        onComplete: () => {
          this.transactionRunning = false;
          this.storeTransaction()
        },
        onJsonResponse: (json) => {
          this.parseJson(json);
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