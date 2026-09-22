<script setup>
import { dotStyle } from '../lib/venue.js'

defineProps({
  room: { type: String, required: true },
})
</script>

<template>
  <span class="inline-block size-2 shrink-0 rounded-full" :style="dotStyle(room)" aria-hidden="true"></span>
</template>
