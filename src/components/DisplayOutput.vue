<template>
  <div>
    <!-- <textarea v-model="markdown"></textarea> -->
    <lili-cont title="Output">
      <div v-html="markdownToHtml"></div>
    </lili-cont>
  </div>
</template>


<script>
import { marked } from 'marked';
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