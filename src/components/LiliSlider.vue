<template>
  <div>
    <q-input
      v-if="!settingsStore.sliderInputs"
      v-model="slideValue"
      filled
      type="number"
      :step="step"
      :min="min"
      :max="max"
      dense />
      <div v-else class="q-px-md q-pb-md">
        <q-slider
          v-model="slideValue"
          class="q-pt-sm q-pb-lg"
          label-always
          switch-label-side
          :step="step"
          :min="min"
          :max="max"
          dense />
      </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useSettingsStore } from 'stores/settings';

export default {
  props: {
    step: {
      type: [Number],
      default: 1
    },
    min: {
      type: [Number],
      default: 0
    },
    max: {
      type: [Number],
      default: 100
    },
    modelValue: null
  },
  computed: {
    ...mapStores(useSettingsStore),
    slideValue: {
      get () { return this.modelValue },
      set (value) { this.$emit('update:modelValue', value) }
    }
  },
  methods: {
    bgIcon (itemName) {
      if (itemName === undefined) return false
      try {
        return require('../assets/items/' + itemName.replace(/ /g, '_').toLowerCase() + '_bg.png')
      } catch (e) {
        return false
      }
    }
  }
}
</script>
