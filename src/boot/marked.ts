import { boot } from 'quasar/wrappers';
import { marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import "highlight.js/styles/github-dark-dimmed.css"

marked.setOptions({
  headerIds: false,
  mangle: false
});

marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    if (hljs.getLanguage(lang)) {
      return hljs.highlightAuto(code, [ lang ]).value;
    }
    return hljs.highlightAuto(code).value;
  }
}));

export { marked };
