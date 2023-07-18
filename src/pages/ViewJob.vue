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
            ref="outputWindow"
            @scroll="scrollHandler"
          >
            <div class="q-pa-md" style="min-height: 100%">
              <!-- Historic Transactions -->
              <div v-for="(row, index) in transactions" :key="index" class="ai_transaction q-mb-sm">
                {{ row }}
                <div v-if="row.workloadDefinition">
                  {{ workloadDefinition }}
                </div>
                <display-prompt class="q-mb-xs" v-model="row.promptConfig" />
                <div v-if="row.outputJson.length > 0" class="q-mb-xs">
                  <!-- <TransitionGroup tag="div" :css="false" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave"> -->
                  <!-- <div
                    v-for="(output, index) in row.outputJson"
                    :key="index">
                      {{ output }}
                    </div> -->
                  <inline-output v-for="(output, index) in row.outputJson" :key="index" :data-index="index" :json="output" />
                  <!-- </TransitionGroup> -->
                </div>
                <!-- <display-output class="q-mb-md" v-if="outputJson.length > 1" v-model="outputJson" /> -->
                <display-output v-model="row.outputText" />
                <q-separator class="q-my-md" />
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
import { startWorkload, reset } from 'services/lili/lili_real';
import { mapStores } from 'pinia';
import { useSettingsStore } from 'stores/settings';
// import gsap from 'gsap';
import { scroll } from 'quasar';
import { useJobStore } from 'stores/job';
const { getScrollPosition, setScrollPosition } = scroll;
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
        height: '7px',
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
      vSize: 0,
    };
  },
  computed: {
    ...mapStores(useSettingsStore, useJobStore),
    lockedPageClass() {
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
    activeTransaction() {
      if (this.transactionRunning === false) return false;
      return this.transactions[this.transactions.length - 1];
    },
  },
  async mounted() {
    reset();
    if (this.$route.params.id) {
      this.loadHistory();
    }
  },
  methods: {
    async loadHistory () {
      const jobDetail = await this.jobStore.loadJobDetail(this.$route.params.id);
      
      this.transactionRunning = true;

      recallWorkload({
        workloadHistory: jobDetail.history || [],
        forEachToken: this.processToken,
        onComplete: async () => {
          console.log('ONCOMPLETE!!!');
          this.transactionRunning = false;
        },
        onJsonResponse: async (json) => {
          this.parseJson(json);
        },
        forEachUserPrompt: async (promptConfig) => {
          this.transactions.push({
            promptConfig: { ...promptConfig },
            outputText: '',
            outputJson: [],
          });
        },
      });
    },
    async processToken(token) {
      if (!this.activeTransaction) {
        console.error('processToken - recieved after onComplete')
        return;
      }
      this.activeTransaction.outputText = this.activeTransaction.outputText + token;
      console.log('processToken', token);
    },
    parseJson(json) {
      if (!this.activeTransaction) {
        console.error('parseJson - recieved after onComplete')
        return;
      }
      this.activeTransaction.outputJson.push(json);
      console.log('parseJson', json);
    },
    startTransaction() {
      this.transactions.push({
        promptConfig: { ...this.promptConfig },
        outputText: '',
        outputJson: [],
      });
    },
    runJob() {
      if (this.transactionRunning) return;
      this.transactionRunning = true;
      this.startTransaction();

      startWorkload({
        prompt: this.promptConfig.prompt,
        workload: this.promptConfig.workload.value,
        forEachToken: this.processToken,
        onComplete: async () => {
          console.log('ONCOMPLETE!!!');
          this.transactionRunning = false;
        },
        onJsonResponse: async (json) => {
          this.parseJson(json);
        },
      });
    },
    scrollHandler(arg) {
      if (arg.verticalSize === this.vSize) return false; // Content height not changed
      this.vSize = arg.verticalSize;
      const scrollArea = this.$refs.outputWindow;
      const scrollTarget = scrollArea.getScrollTarget();
      const duration = 300; // ms - use 0 to instant scroll
      scrollArea.setScrollPosition('vertical', scrollTarget.scrollHeight, duration);
    },
    // onBeforeEnter(el) {
    //   el.style.opacity = 0
    //   el.style.height = 0
    // },
    // onEnter(el, done) {
    //   console.log('onEnter', el.dataset.index);
    //   gsap.to(el, {
    //     opacity: 1,
    //     height: '1.6em',
    //     delay: el.dataset.index * 5,
    //     onComplete: done
    //   })
    // },
    // onLeave(el, done) {
    //   gsap.to(el, {
    //     opacity: 0,
    //     height: 0,
    //     delay: el.dataset.index * 0.15,
    //     onComplete: done
    //   })
    // }
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