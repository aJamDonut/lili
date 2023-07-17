<template>
  <div>
    <div class="row items-center q-col-gutter-sm q-mb-xs">
      <div class="col-shrink">
        <q-icon :name="iconName" :color="iconColor" size="20px" />
      </div>
      <div class="col inline-output">
        {{ json.content }}
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
.inline-output{
  opacity: .8;
  font-size: 13px;
}
</style>