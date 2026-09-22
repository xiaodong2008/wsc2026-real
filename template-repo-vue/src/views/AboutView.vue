<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <h1>About</h1>
  <p>
    A second route, so the app is a real single-page application: navigating here
    swaps the view without a full page load.
  </p>
  <p>Current path: <code>{{ route.path }}</code></p>
</template>
