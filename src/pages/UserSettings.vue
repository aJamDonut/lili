<template>
  <q-page padding>
    <lili-cont title="Settings">
      <label>Slider Inputs</label>
      <q-toggle v-model="settingsStore.sliderInputs" />
      <br />
      <label>Theme</label>
      <q-select
        v-model="theme"
        filled
        :options="themeOptions"
        dense />
    </lili-cont>
  </q-page>
</template>


<script>
import { mapStores } from 'pinia'
import { useSettingsStore } from '../stores/settings';

export default {
  data () {
    return {
      theme2: null,
      themeOptions: [
        {
          label: 'Light',
          value: false
        },
        {
          label: 'Dark',
          value: true
        },
        {
          label: 'Auto Detect',
          value: 'auto'
        }
      ]
    }
  },
  computed: {
    ...mapStores(useSettingsStore),
    theme: {
      get () {
        return { value: this.settingsStore.darkMode, label: this.themeOptions.find(x => x.value === this.settingsStore.darkMode).label }
      },
      set (val) {
        this.settingsStore.darkMode = val.value
      }
    }
  }
};
</script>
