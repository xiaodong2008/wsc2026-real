<script setup>
import { computed, onMounted, ref } from 'vue'
import RoomDot from '../components/RoomDot.vue'
import { loadJSON } from '../lib/data.js'
import { codeOf } from '../lib/stamps.js'
import { errorMessage } from '../lib/ui.js'

const sessions = ref([])
const mode = ref('sessions')
const day = ref(1)
const screen = ref('list')
const current = ref(null)

const daySessions = computed(() => sessions.value.filter((item) => item.day === day.value))

const speakers = computed(() => {
  const grouped = new Map()
  for (const session of sessions.value) {
    if (!grouped.has(session.speaker)) {
      grouped.set(session.speaker, {
        name: session.speaker,
        photo: `speakers/${session.speaker.toLowerCase().replaceAll(' ', '-')}.jpg`,
        sessions: [],
      })
    }
    grouped.get(session.speaker).sessions.push(session)
  }
  return [...grouped.values()].filter((speaker) => speaker.sessions.some((item) => item.day === day.value))
})

function openSession(session) {
  current.value = session
  screen.value = 'session'
}

function openSpeaker(speaker) {
  current.value = speaker
  screen.value = 'speaker'
}

function back() {
  screen.value = 'list'
  current.value = null
}

function sessionsOnDay(speaker) {
  return speaker.sessions.filter((item) => item.day === day.value)
}

onMounted(async () => {
  errorMessage.value = ''
  const data = await loadJSON('api/schedule.json', 'Could not load the schedule. Please try again.')
  if (data) sessions.value = data
})
</script>

<template>
  <section>
    <div class="mb-3 flex gap-2" role="tablist">
      <button type="button" class="rounded-full px-3 py-2 text-sm" :class="mode === 'sessions' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'" @click="mode = 'sessions'; back()">Sessions</button>
      <button type="button" class="rounded-full px-3 py-2 text-sm" :class="mode === 'speakers' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'" @click="mode = 'speakers'; back()">Speakers</button>
    </div>
    <div class="mb-3 flex gap-2">
      <button v-for="n in 4" :key="n" type="button" class="rounded-full px-3 py-2 text-sm" :class="day === n ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'" @click="day = n; back()">Day {{ n }}</button>
    </div>

    <div v-if="screen === 'list' && mode === 'sessions'" data-testid="schedule-list" class="grid gap-2.5">
      <button v-for="session in daySessions" :key="session.id" type="button" class="grid gap-1 rounded-2xl bg-white p-3 text-left" @click="openSession(session)">
        <strong>{{ session.title }}</strong>
        <span>{{ session.speaker }}</span>
        <span>{{ session.time }}–{{ session.endTime }}</span>
        <span class="flex items-center gap-1.5"><RoomDot :room="session.room" /> {{ session.roomName }}</span>
      </button>
    </div>

    <div v-else-if="screen === 'list'" class="grid gap-2.5 md:grid-cols-2">
      <button v-for="speaker in speakers" :key="speaker.name" type="button" class="grid grid-cols-[56px_1fr] items-center gap-3 rounded-2xl bg-white p-3 text-left" @click="openSpeaker(speaker)">
        <img class="size-14 rounded-full object-cover" :src="speaker.photo" :alt="speaker.name" />
        <div>
          <strong>{{ speaker.name }}</strong>
          <p v-for="session in sessionsOnDay(speaker)" :key="session.id">
            {{ session.title }} <RoomDot :room="session.room" />
          </p>
        </div>
      </button>
    </div>

    <article v-else-if="screen === 'session'">
      <button type="button" class="mb-3 rounded-full bg-white px-3 py-2 text-sm" @click="back">← Back</button>
      <h1 class="mb-2 text-3xl font-bold">{{ current.title }}</h1>
      <p>Speaker {{ current.speaker }}</p>
      <p>Time {{ current.time }}–{{ current.endTime }}</p>
      <p class="flex items-center gap-1.5"><RoomDot :room="current.room" /> {{ current.roomName }}</p>
      <p>Day {{ current.day }}</p>
      <p class="mt-3 w-fit border border-dashed border-green-600 px-3 py-2.5 font-mono text-green-800">{{ codeOf(current) }}</p>
    </article>

    <article v-else>
      <button type="button" class="mb-3 rounded-full bg-white px-3 py-2 text-sm" @click="back">← Back</button>
      <img class="size-28 rounded-full object-cover" :src="current.photo" :alt="current.name" />
      <h1 class="mb-2 text-3xl font-bold">{{ current.name }}</h1>
      <h2 class="font-semibold">Sessions</h2>
      <p v-for="session in current.sessions" :key="session.id">
        {{ session.title }} — Day {{ session.day }}, {{ session.time }}, <RoomDot :room="session.room" /> {{ session.roomName }}
      </p>
    </article>
  </section>
</template>
