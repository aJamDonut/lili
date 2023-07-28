<template>
  <div v-if="!settingsStore.isValidKey" class="overlay flex flex-center">
    <div class="row items-end q-col-gutter-xs">
      <div><q-icon name="sym_o_info" size="20px" /></div>
      <div>{{ $t('validate_license') }}</div>
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useSettingsStore } from 'stores/settings';

export default {
  computed: {
    ...mapStores(useSettingsStore)
  }
}
</script>
