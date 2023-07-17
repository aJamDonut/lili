<template>
  <div>
    <lili-cont :title="false">
      <template v-slot:title>
        <div class="row items-center">
          <div class="col">{{ $t('prompt') }}</div>
          <div class="col-shrink hidden">
            <q-chip outline size="10px" color="primary" text-color="white">Workload: {{ promptConfig.workload }}</q-chip>
            <q-chip outline size="10px" color="green" text-color="white">Creativity: {{ promptConfig.creativity }}</q-chip>
            <q-chip outline size="10px" color="orange" text-color="white">Repetitiveness: {{ promptConfig.repetitiveness }}</q-chip>
            <q-chip outline size="10px" color="red" text-color="white">Response Limit: {{ promptConfig.responseLimit }}</q-chip>
            <q-chip outline size="10px" color="teal" text-color="white">Solution Count: {{ promptConfig.solutionCount }}</q-chip>
          </div>
        </div>
      </template>
      {{ promptConfig.prompt }}
    </lili-cont>
  </div>
</template>


<script>
export default {
  props: {
    modelValue: null,
  },
  computed: {
    promptConfig: {
      get () { return this.modelValue },
      set (value) { this.$emit('update:modelValue', value) }
    }
  }
};
</script>