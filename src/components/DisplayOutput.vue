<template>
  <div>
    <lili-cont title="Debug" class="q-mb-sm" v-if="showDebug">
      <textarea v-model="markdown"></textarea>
    </lili-cont>
    <lili-cont :title="true">
      <template v-slot:title>
        <div class="row items-center">
          <div class="col">Output</div>
          <div class="col-shrink">
            <q-btn size="10px" @click="showDebug = !showDebug" outline color="primary">Debug</q-btn>
          </div>
        </div>
      </template>
      <div v-html="markdownToHtml"></div>
    </lili-cont>
  </div>
</template>


<script>
// Markdown Parser
import { marked } from 'marked';

// Syntax Highlighting (highlight.js)
import hljs from 'highlight.js';
import "highlight.js/styles/github-dark-dimmed.css"

export default {
  data() {
    return {
      showDebug: false,
    //   markdown: " # hello world \n ```js\n function hello(){ console.log(Hello World) } \n```",
    };
  },
  props: {
    modelValue: null,
  },
  computed: {
    markdown: {
      get () { return this.modelValue },
      set (value) { this.$emit('update:modelValue', value) }
    },
    markdownToHtml(){
      return marked.parse(this.markdown);
    }
  },
  beforeMount() {
    marked.setOptions({
      highlight: (code, lang) => {
        const langObj = hljs.getLanguage(lang) ? [lang] : undefined;
        return hljs.highlightAuto(code, langObj).value;
      },
      langPrefix: 'hljs lang-'
    })
  }
};
</script>

<style lang="scss" scoped>
textarea{
  width: 100%;
  height: 200px;
}
</style>