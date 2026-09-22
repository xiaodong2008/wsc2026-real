<script setup>
import { onMounted, ref } from 'vue'
import { loadJSON } from '../lib/data.js'
import { codeOf, loadCollected, saveCollected } from '../lib/stamps.js'
import { errorMessage } from '../lib/ui.js'

const sessions = ref([])
const collected = ref(loadCollected())
const code = ref('')
const justId = ref('')

function dayOf(n) {
  return Math.floor((n - 1) / 4) + 1
}

async function onCollect() {
  const typed = code.value.trim().toLowerCase()
  const hit = sessions.value.find((session) => codeOf(session) === typed)
  if (!hit) {
    errorMessage.value = 'Incorrect attendance code. Please try again.'
    return
  }
  if (collected.value.has(hit.id)) {
    errorMessage.value = 'You already collected this stamp.'
    return
  }
  const next = new Set(collected.value)
  next.add(hit.id)
  collected.value = next
  saveCollected(next)
  justId.value = hit.id
  errorMessage.value = ''
  code.value = ''
}

onMounted(async () => {
  errorMessage.value = ''
  const data = await loadJSON('api/schedule.json', 'Could not load the schedule. Please try again.')
  if (data) sessions.value = data
})
</script>

<template>
  <section>
    <header>
      <h1 class="text-[22px] font-bold">Attendance Stamps</h1>
      <p class="my-1.5">{{ collected.size }} out of 16</p>
      <progress class="h-3 w-full" max="16" :value="collected.size"></progress>
    </header>
    <form class="sticky top-0 z-10 flex items-end gap-2 bg-[#f6f7fb] py-2.5" @submit.prevent="onCollect">
      <label class="grid flex-1 gap-1 text-[13px] font-semibold">
        Enter attendance code
        <input class="rounded-[10px] border border-slate-300 bg-white px-2.5 py-2.5" v-model="code" autocomplete="off" />
      </label>
      <button class="rounded-[10px] bg-blue-600 px-3.5 py-2.5 text-white" type="submit">Collect</button>
    </form>
    <ol class="mt-3 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4">
      <li v-for="n in 16" :key="n" class="relative text-center">
        <img
          class="aspect-square w-full object-contain motion-reduce:animate-none"
          :class="[collected.has(String(n)) ? 'opacity-100' : 'opacity-35', justId === String(n) ? 'animate-stamp-pop' : '']"
          :src="`stamps/${n}.png`"
          :alt="`Stamp ${n}`"
        />
        <span v-if="justId === String(n)" class="ribbons motion-reduce:animate-none" aria-hidden="true"></span>
        <span>#{{ n }} · Day {{ dayOf(n) }}</span>
      </li>
    </ol>
  </section>
</template>
