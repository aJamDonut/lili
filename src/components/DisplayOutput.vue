<template>
  <div>
    <lili-cont title="Debug" v-if="showDebug">
      <textarea v-model="markdown"></textarea>
      <q-btn @click="switchHighlightEngine" color="green">Switch Highlight Engine</q-btn>
      Engine: {{ highlightEngine }}
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
import "highlight.js/styles/github.css"

// Syntax Highlighting (prism.js)
import prism from 'prismjs';
import "prismjs/themes/prism.css"; // you can change

// Langs
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-liquid';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-scss';


export default {
  data() {
    return {
      highlightEngine: 'highlightjs',
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
  methods: {
    switchHighlightEngine(){
      if(this.highlightEngine === 'prism'){
        this.highlightEngine = 'highlightjs';
      } else {
        this.highlightEngine = 'prism';
      }
    }
  },
  beforeMount() {
    marked.setOptions({
      highlight: (code, lang) => {
        console.log('highlight', code, lang)
        if (this.highlightEngine === 'highlightjs') {
          const langObj = hljs.getLanguage(lang) ? [lang] : undefined;
          console.log('langObj', langObj)
          return hljs.highlightAuto(code, langObj).value;
        }
        
        if (prism.languages[lang]) {
          return prism.highlight(code, prism.languages[lang], lang);
        } else {
          return code;
        }
      }
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