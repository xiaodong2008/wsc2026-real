<script setup>
import { RouterView } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
import { errorMessage } from './lib/ui.js'
</script>

<template>
  <div class="min-h-screen bg-[#f6f7fb] text-slate-900">
    <header class="flex h-[52px] items-center border-b border-slate-200 bg-white px-4 font-bold">
      Mobile Conference
    </header>
    <p class="empty:hidden px-4 font-semibold text-rose-800" data-testid="error-message">{{ errorMessage }}</p>
    <main class="h-[calc(100vh-52px)] overflow-auto px-4 pt-3 pb-24">
      <RouterView />
    </main>
    <BottomNav />
  </div>
</template>
