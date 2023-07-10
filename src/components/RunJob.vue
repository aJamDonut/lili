<template>
  <div class="q-pa-md">
    <label class="text-h5">Prompt</label>
    <q-input
      v-model="prompt"
      type="textarea"
      rows="3"
      autogrow
      dense
      class="q-mb-md"
    ></q-input>

    <label class="text-h5">Context</label>
    <q-input
      v-model="context"
      type="textarea"
      rows="3"
      autogrow
      dense
      class="q-mb-md"
    ></q-input>

    <label class="text-h5">Workload</label>
    <q-select
      v-model="workload"
      :options="workloadOptions"
      dense
      class="q-mb-md"
    ></q-select>

    <label class="text-h5">Output Format</label>
    <q-select
      v-model="outputFormat"
      :options="outputFormatOptions"
      dense
      class="q-mb-md"
    ></q-select>

    <label class="text-h5">Output To</label>
    <q-select
      v-model="outputTo"
      :options="outputToOptions"
      dense
      class="q-mb-md"
    ></q-select>

    <label class="text-h5">Creativity</label>
    <q-input
      v-model="creativity"
      type="number"
      step="0.01"
      min="0.5"
      max="1"
      dense
      class="q-mb-md"
    ></q-input>

    <label class="text-h5">Repetitiveness</label>
    <q-input
      v-model="repetitiveness"
      type="number"
      step="0.01"
      min="0.5"
      max="1"
      dense
      class="q-mb-md"
    ></q-input>

    <label class="text-h5">Response Limit</label>
    <q-input
      v-model="responseLimit"
      type="number"
      min="0"
      :max="32000"
      dense
      class="q-mb-md"
    ></q-input>

    <label class="text-h5">Solution Count</label>
    <q-input
      v-model="solutionCount"
      type="number"
      min="1"
      max="5"
      dense
    ></q-input>
  </div>


</template>


<style scoped>
.q-mb-md {
  margin-bottom: 16px;
}
</style>

<script>
import { marked } from 'marked';
//import Prism from 'prismjs';

export default {
  data() {
    return {
      prompt: '',
      context: '',
      workload: 'New',
      outputFormat: 'Plaintext',
      outputTo: 'Inline',
      creativity: 0.5,
      repetitiveness: 0.5,
      responseLimit: 16000,
      solutionCount: 1,
      workloadOptions: ['New', 'Edit'],
      outputFormatOptions: ['Plaintext', 'Chat', 'HTML'],
      outputToOptions: ['Inline', 'Cursor', 'Folder'],
    };
  },
  computed: {
    markdownToHtml() {
      return 'test'
    },
  },
  updated() {
    console.log('Updated');
  },
};
</script>

