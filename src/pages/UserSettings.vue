<template>
  <q-page padding>
    <lili-cont title="Settings">
      <label>Slider Inputs</label>
      <q-toggle v-model="settingsStore.sliderInputs" class="q-mb-md" />
      <br />
      <label>Theme</label>
      <q-select
        v-model="theme"
        filled
        :options="themeOptions"
        class="q-mb-md"
        dense />
        
      <label>ChatGPT Key</label>
      <q-input
        v-model="settingsStore.chatGPTKey"
        filled
        class="q-mb-md"
        dense />
    </lili-cont>
  </q-page>
</template>


<script>
import { mapStores } from 'pinia'
import { useSettingsStore } from 'stores/settings';

export default {
  data () {
    return {
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
