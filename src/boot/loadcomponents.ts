import { boot } from 'quasar/wrappers';

import ShowsAdam from '../components/ShowsAdam.vue';
import ExampleComponent from '../components/ExampleComponent.vue';

export default boot(async ({ app }) => {
  app.component('shows-adam', ShowsAdam);
  app.component('example-component', ExampleComponent);
});
