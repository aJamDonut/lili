<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useSettingsStore } from 'stores/settings';

export default {
  computed: {
    ...mapStores(useSettingsStore)
  },
  beforeMount () {
    console.log('darkmode', this.$q.dark.mode)
    this.$q.dark.set(this.settingsStore.darkMode)
  },
  watch: {
    'settingsStore.darkMode': function (val) {
      console.log('new darkmode', val)
      this.$q.dark.set(val)
    }
  }
};
</script>
