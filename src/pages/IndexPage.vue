<template>
  <q-page padding>
    Index Page<br /><br />

    Is key valid: {{ settingsStore.isValidKey }}<br />

    <q-btn @click="toggleDisplayOutput" color="green">Toggle Display Output</q-btn>
    <div v-if="displayOutput" class="q-py-lg">
      <display-output v-model="markdown" />
    </div>

    <ul>
      <li>The 3 phases of learning liliFLUX:</li>
      <ol>
        <li>I'm messing around and having fun.</li>
        <li>I've made custom workloads to do work faster.</li>
        <li>I don't work anymore liliFLUX does it all.</li>
      </ol>
      <li>The 3 steps of AI with liliFLUX:</li>
      <ol>
        <li>Priming - Get the AI ready with repeatable rules</li>
        <li>Context - Provide the AI with the context it needs to get the job done</li>
        <li>Output - Provide the AI with the ability to create, update and modify content directly</li>
      </ol>
    </ul>
  </q-page>
</template>


<script>
import { mapStores } from 'pinia';
import { useSettingsStore } from 'stores/settings';

export default {
  data() {
    return {
      displayOutput: false,
      markdown: ' # hello world \n ```js\n function hello(){ console.log(Hello World) } \n```',
    };
  },
  computed: {
    ...mapStores(useSettingsStore),
  },
  methods: {
    toggleDisplayOutput() {
      this.displayOutput = !this.displayOutput;
    },
  },
};
</script>

<style lang="scss" scoped>
textarea {
  width: 100%;
  height: 200px;
}
</style>