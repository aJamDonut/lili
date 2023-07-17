<template>
    <div>
      <component :is="activeLayout" :json="json" />
    </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

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
    activeLayout() {
      const components = import.meta.glob('./inline/*.vue');
      // Filter components into the names of the files without the extension
      const componentNames = Object.keys(components).map((fileName) => {
        return fileName.replace(/(.*\/)*([^.]+).*/gi, '$2');
      });
      let layout = (!this?.json?.component) ? 'inline_default' : this.json.component;
      if (!componentNames.includes(layout)) {
        layout = 'inline_default';
      }
      return defineAsyncComponent(() => import("./inline/" + layout + ".vue"))
    }
  }
};
</script>