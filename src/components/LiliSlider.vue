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
    <q-slider
      v-else
      v-model="slideValue"
      class="q-py-lg"
      label-always
      switch-label-side
      :step="step"
      :min="min"
      :max="max"
      dense />
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useSettingsStore } from '../stores/settings';

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

<style lang="scss">
.zed-grid {
  box-sizing: border-box;
  .title {
    width: 100%;
    background: $grey-3;
    border-radius: 4px;
    text-align: left;
    white-space: nowrap;
    padding: 6px 12px;
    color: rgba($primary, .8);
    text-transform: uppercase;
    // font-weight: bold;
    letter-spacing: .05em;
    font-size: 11px;
  }

  &.has-content .title {
    border-radius: 4px 4px 0 0;
  }

  .actions {
    position: absolute;
    left: 0;
    bottom: 6px;
    z-index: 4;
    width: 100%;
  }

  .grid-cont {
    // position: relative;
    display: block;
    background-color: transparent;
    padding: 12px 10px;
    color: $text;
    // font-size: 12px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    box-sizing: border-box;
    border-radius: 4px;
    // box-shadow: inset 0 0 1px 1px $border-1, $box-shadow-1;
    border: 1px solid $grey-3;
    width: 100%;
    height: 100%;
  }

  &.has-title .grid-cont {
    border-radius: 0 0 4px 4px;
    border-top: 1px solid lighten($grey-3, 15%);
    height: calc(100% - 30px);
  }

  .grid-cont.has-actions {
    padding: 18px 10px 42px;
  }

  .grid-cont.no-padding {
    padding: 0;
  }

  .grid-cont .content {
    position: relative;
    z-index: 2;
  }

  &.click-event:hover .grid-cont {
    background-color: lighten($grey-1, 4%) !important;
  }
  &.click-event .grid-cont {
    cursor: pointer;
  }

  /* For grid background icon (used in stronghold) */
  .cont-bg.grid-cont .grey-icon {
    position: absolute;
    content: " ";
    width: 50px;
    height: 50px;
    left: 2px;
    bottom: 0;
    opacity: 0.25;
    img {
      width: 50px;
      height: 50px;
    }
  }
}
</style>
