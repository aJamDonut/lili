<template>
  <q-page padding>
    <prompt-form v-model="promptConfig" @run="runJob" />
  </q-page>
</template>


<script>
/*
import { ElectronStorage } from '../services/lili/drivers/Storage/ElectronStorage';

let storage = new ElectronStorage();

storage.writeFile('test', 'test.txt', 'im a test');
*/
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
