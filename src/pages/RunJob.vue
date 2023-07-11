<template>
  <q-page padding>
    <prompt-form v-model="promptConfig" @run="runJob" />
  </q-page>
</template>


<script>
import { getHistory, getHistoricWorkload } from '../services/lili/lili_real';

console.log('History', await getHistory());

console.log('History ID 10 ', await getHistoricWorkload(10)); //Its the history.id, not index in array.

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
    };
  },
  methods: {
    runJob() {
      // Need to get job ID here from Class?
      this.$router.push({ path: '/jobs/1' });
    },
  },
};
</script>
