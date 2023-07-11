<template>
  <q-page padding>
    <lili-cont title="Prompt Config">
      <label>Slider Inputs</label>
      <q-toggle v-model="settingsStore.sliderInputs" />
    </lili-cont>
  </q-page>
</template>


<script>
import { mapStores } from 'pinia'
import { useSettingsStore } from '../stores/settings';

export default {
  computed: {
    ...mapStores(useSettingsStore)
  },
  data() {
    return {
      sliderInputs: false
    };
  }
};
</script>
