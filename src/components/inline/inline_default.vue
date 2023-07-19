<template>
  <div class="inline_default">
    <div class="row items-center">
      <div class="col-shrink q-pa-xs">
        <q-icon name="psychology" size="22px" color="grey-6" />
      </div>
      <div class="col inline-output q-pa-xs">
        {{ json.content }}
      </div>
      <div class="col-shrink q-pa-xs">
        <q-icon :name="iconName" :color="iconColor" size="20px" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useSettingsStore } from 'stores/settings';

export default {
  props: {
    json: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  computed: {
    ...mapStores(useSettingsStore),
    iconName() {
      if (this.json.state === 'error') return 'close';
      if (this.json.state === 'warning') return 'sym_o_priority_high';
      if (this.json.state === 'success') return 'check';
      return false;
    },
    iconColor() {
      if (this.json.state === 'error') return 'red';
      if (this.json.state === 'warning') return 'orange';
      if (this.json.state === 'success') return 'green';
      return false;
    }
  }
}
</script>

<style lang="scss" scoped>
.inline_default {
  margin-bottom: 3px;
  border-radius: 4px;
}
.inline-output{
  opacity: .8;
  font-size: 13px;
}
</style>