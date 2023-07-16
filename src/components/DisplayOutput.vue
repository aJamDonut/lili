<template>
  <div>
    <lili-cont :title="$t('debug')" class="q-mb-sm" v-if="showDebug">
      <textarea v-model="markdown"></textarea>
      
    </lili-cont>
    <lili-cont :title="true">
      <template v-slot:title>
        <div class="row items-center">
          <div class="col">{{ $t('output') }}</div>
          <div class="col-shrink">
            <q-btn size="10px" @click="showDebug = !showDebug" outline color="primary">{{ $t('debug') }}</q-btn>
          </div>
        </div>
      </template>
      <div v-html="markdownToHtml"></div>
    </lili-cont>
  </div>
</template>


<script>
// Markdown Parser
import { marked } from 'boot/marked';

export default {
  data() {
    return {
      showDebug: false
    };
  },
  props: {
    modelValue: null,
  },
  computed: {
    markdown: {
      get () { return this.modelValue },
    },
    markdownToHtml() {
      return marked(this.markdown);
    }
  }
};
</script>

<style lang="scss" scoped>
textarea{
  width: 100%;
  height: 200px;
}
</style>