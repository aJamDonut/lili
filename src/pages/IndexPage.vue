<template>
  <q-page class="">
    <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
    <example-component></example-component>
    <q-drawer show-if-above v-model="rightOpen" side="right" bordered>
      <h1>Content</h1>
    </q-drawer>
  </q-page>
</template>


<script>
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

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
      rightOpen: true,
    };
  },
  methods: {
    toggleRightDrawer() {
      this.rightOpen = !this.rightOpen;
    },
  },
  updated: function () {
    this.$nextTick(function () {
      Prism.highlightAll();
      console.log(Prism, 'prism');
    });
  },
};
</script>

