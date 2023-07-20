<template>
  <q-page>
    <div class="flex flex-center">
      <div class="absolute-full">
        <div class="row items-start justify-center q-col-gutter-lg full-height" >
          <div class="col-md-3">
            <div class="q-pa-lg q-ma-lg">
              <h1 class="page-title">Getting Started</h1>
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
            <div class="q-pa-lg q-ma-lg">
              <h1 class="page-title">Recent</h1>
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
          <div class="col-md-3">
            <div class="q-pa-lg q-ma-lg">
              <h1 class="page-title">Title</h1>
              <div>
                Some content
              </div>
            </div>
            <div class="q-pa-lg q-ma-lg">
              <h1 class="page-title">Title</h1>
              <div>
                Some content
              </div>
            </div>
            <div class="q-pa-lg q-ma-lg">
              <h1 class="page-title">Title</h1>
              <div>
                Some content
              </div>
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
          url: 'job',
          separator: false,
        },
        {
          icon: 'psychology',
          label: 'workloads',
          url: 'workloads',
          separator: false,
        },
        {
          icon: 'history',
          label: 'job_history',
          url: 'history',
          separator: false,
        },
        {
          icon: 'settings',
          label: 'settings',
          url: 'settings',
          separator: false,
        },
      ]
    };
  },
  computed: {
    ...mapStores(useSettingsStore, useJobStore),
    // Create a computed property that returns 5 of the most recent jobs (from the end of the array) - try again it didnt work
    recentJobs() {
      if (!this.jobStore.jobHistory) return [];
      if (this.jobStore.jobHistory.length > 5) {
        return this.jobStore.jobHistory.slice(-5)
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