<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-20 grid h-16 grid-cols-4 border-t border-slate-200 bg-white" aria-label="Sections">
    <RouterLink class="grid place-items-center text-sm font-semibold text-slate-500 nav-on:text-blue-600" to="/schedule" data-testid="nav-schedule">Schedule</RouterLink>
    <RouterLink class="grid place-items-center text-sm font-semibold text-slate-500 nav-on:text-blue-600" to="/map" data-testid="nav-map">Map</RouterLink>
    <RouterLink class="grid place-items-center text-sm font-semibold text-slate-500 nav-on:text-blue-600" to="/stamps" data-testid="nav-stamps">Stamps</RouterLink>
    <RouterLink class="grid place-items-center text-sm font-semibold text-slate-500 nav-on:text-blue-600" to="/photo" data-testid="nav-photo">Photo</RouterLink>
  </nav>
</template>
