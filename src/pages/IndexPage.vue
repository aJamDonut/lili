<template>
  <q-page padding>
    Index Page<br /><br />

    <q-btn @click="toggleDisplayOutput" color="green">Toggle Display Output</q-btn>
    <div v-if="displayOutput" class="q-py-lg">
      <display-output v-model="markdown" />
    </div>

  </q-page>
</template>


<script>
export default {
  data() {
    return {
      displayOutput: false,
      markdown: " # hello world \n ```js\n function hello(){ console.log(Hello World) } \n```",
    };
  },
  methods: {
    toggleDisplayOutput() {
      this.displayOutput = !this.displayOutput;
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