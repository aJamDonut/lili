import { boot } from 'quasar/wrappers';

import DisplayOutput from '../components/DisplayOutput.vue';
import DisplayPrompt from '../components/DisplayPrompt.vue';
import LiliCont from '../components/LiliCont.vue';
import LiliSlider from '../components/LiliSlider.vue';
import PromptForm from '../components/PromptForm.vue';

export default boot(async ({ app }) => {
  app.component('display-output', DisplayOutput);
  app.component('display-prompt', DisplayPrompt);
  app.component('lili-cont', LiliCont);
  app.component('lili-slider', LiliSlider);
  app.component('prompt-form', PromptForm);
});
