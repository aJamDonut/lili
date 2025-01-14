<template>
  <q-page>
    <div>
      <div>
        <div class="row items-start justify-left q-col-gutter-lg full-height">
          <div class="col-md-4">
            <div class="q-pa-lg">
              <lili-title :title="$t('getting_started')" />
              <q-list>
                <template v-for="(menuItem, index) in menuList" :key="index">
                  <q-item clickable :active="false" :to="{ path: '/' + menuItem.url }" v-ripple>
                    <q-item-section avatar>
                      <q-icon :name="menuItem.icon" />
                    </q-item-section>
                    <q-item-section>
                      {{ $t(menuItem.label) }}
                    </q-item-section>
                  </q-item>
                  <q-separator :key="'sep' + index" v-if="menuItem.separator" />
                </template>
              </q-list>
            </div>
            <div class="q-pa-lg">
              <lili-title :title="$t('recent')" />
              <q-list>
                <template v-for="(history, index) in recentJobs" :key="index">
                  <q-item dense clickable :active="false" :to="{ path: '/job/' + history.meta.id }" v-ripple>
                    <q-item-section avatar>
                      <q-icon name="receipt" />
                    </q-item-section>
                    <q-item-section>
                      {{ history.meta.id }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </div>
          </div>
          <div class="col-sm-8">
              <div class="q-pa-lg">
                <lili-cont :title="$t('how_to_start')">
                  <ol>
                    <li>Come up with an idea</li>
                    <li>Create a new workload with the plus icon</li>
                    <li>Describe how the AI should act using messages (primer)</li>
                    <li>Save your workload and test it out!</li>
                  </ol>
                </lili-cont>
              </div>
            <div class="q-pa-lg">
              <lili-cont :title="$t('terminology')">
                <ul>
                  <li>Prompt - A message you send to the AI</li>
                  <li>History - A history of messages, normally sent to the AI</li>
                  <li>Workload - A repeatable prompt with history already pre-filled in</li>
                </ul>
              </lili-cont>
            </div>
            <div class="q-pa-lg">
              <lili-cont :title="$t('tips')">
                <ul>
                  <li>If the user wants, the AI can read and saves files, simply by asking</li>
                  <li>Files and folders available to the AI are currently stored in:</li>
                  <li>UserData/workspaces/default</li>
                  <br />
                  <li>You can turn a chat history into a workload by simply clicking the "Create workload" button</li>
                </ul>
              </lili-cont>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>


<script>
import { mapStores } from 'pinia';
import { useSettingsStore } from 'stores/settings';
import { useJobStore } from 'stores/job';

export default {
  data() {
    return {
      menuList: [
        {
          icon: 'add',
          label: 'run_job',
          url: 'job/history',
          separator: false,
        },
        {
          icon: 'psychology',
          label: 'workloads',
          url: 'history/user',
          separator: false,
        },
        {
          icon: 'history',
          label: 'job_history',
          url: 'history/history',
          separator: false,
        },
        {
          icon: 'settings',
          label: 'settings',
          url: 'settings',
          separator: false,
        },
      ],
    };
  },
  computed: {
    ...mapStores(useSettingsStore, useJobStore),
    // Create a computed property that returns 5 of the most recent jobs (from the end of the array) - try again it didnt work
    recentJobs() {
      if (!this.jobStore.jobHistory) return [];
      if (this.jobStore.jobHistory.length > 5) {
        return this.jobStore.jobHistory.slice(-5);
      } else {
        return this.jobStore.jobHistory;
      }
    },
  },
  methods: {
    toggleDisplayOutput() {
      this.displayOutput = !this.displayOutput;
    },
  },
  beforeMount() {
    this.jobStore.getHistory();
  },
};
</script>

<style lang="scss" scoped>
textarea {
  width: 100%;
  height: 200px;
}
</style>