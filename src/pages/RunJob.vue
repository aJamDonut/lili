<template>
  <q-page padding>
    <prompt-form v-model="promptConfig" @run="runJob" />
  </q-page>
</template>


<script>
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
      splitterModel: 100
    };
  },
  methods: {
    runJob() {
      // Need to get job ID here from Class?
      this.$router.push({ path: '/jobs/1' });
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