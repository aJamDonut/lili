<template>
  <div class="page-title">
    <h1>{{ title }}</h1>
    <p v-if="desc">{{ desc }}</p>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    desc: [String, Boolean],
  }
}
</script>
