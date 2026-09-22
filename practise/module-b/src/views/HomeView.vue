<script setup>
import { ref, version } from 'vue'

const count = ref(0)
</script>

<template>
  <h1>Vue <span class="v">{{ version }}</span></h1>
  <p>WSC2026 Web Technologies — minimal Vue app (Vite).</p>
  <button @click="count++">Clicked {{ count }} times</button>
</template>
