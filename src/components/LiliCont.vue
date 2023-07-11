<template>
  <div @click="$emit('click')" :class="gridClasses">
    <div v-if="title" class='title'>
      <span v-if="title !== true">{{ title }}</span>
      <slot name="title" />
    </div>
    <div v-if="hasContent" :class="gridContClasses">
        <slot />
        <slot name="actions" />
      <div v-if="bgIcon(contentBg)" class='grey-icon'><img :src="bgIcon(contentBg)" draggable="false" /></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: [String, Boolean],
    subtitle: String,
    contentClass: String,
    contentBg: String,
    disablePadding: [Boolean, String]
  },
  computed: {
    hasClickListener () {
      if (this.$attrs && this.$attrs.onClick) return true
      return false
    },
    hasContent () {
      return (!!this.$slots.default || !!this.$slots['actions'])
    },
    gridClasses () {
      let classes = ['lili-grid']
      if (this.title) classes.push('has-title')
      if (this.hasContent) classes.push('has-content')
      if (this.hasClickListener === true) classes.push('click-event')
      return classes
    },
    gridContClasses () {
      console.log('noPadding', this.disablePadding)
      // this.contentClass = (this.contentClass) ? this.contentClass : ''
      let classes = ['grid-cont']
      if (this.contentBg) classes.push('cont-bg')
      if (this.$slots['actions']) classes.push('has-actions')
      if (this.disablePadding) classes.push('no-padding')
      if (this.contentClass) classes.push(this.contentClass)
      return classes
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
.lili-grid {
  box-sizing: border-box;
  .title {
    width: 100%;
    background: $grey-3;
    border-radius: 4px;
    text-align: left;
    white-space: nowrap;
    padding: 6px 12px;
    text-transform: uppercase;
    // font-weight: bold;
    letter-spacing: .05em;
    font-size: 11px;
    .body--dark & {
      background: $grey-10;
    }
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
    // font-size: 12px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    box-sizing: border-box;
    border-radius: 4px;
    // box-shadow: inset 0 0 1px 1px $border-1, $box-shadow-1;
    border: 1px solid $grey-3;
    width: 100%;
    height: 100%;
    .body--dark & {
      border-color: $grey-10;
    }
  }

  &.has-title .grid-cont {
    border-radius: 0 0 4px 4px;
    border-top: 1px solid lighten($grey-3, 15%);
    height: calc(100% - 30px);
    .body--dark & {
      border-color: $grey-10;
    }
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
