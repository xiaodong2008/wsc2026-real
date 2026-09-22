<script setup>
import { ref } from 'vue'
import RoomDot from '../components/RoomDot.vue'
import { loadJSON } from '../lib/data.js'
import { errorMessage } from '../lib/ui.js'

const open = ref(false)
const title = ref('')
const sessions = ref([])

const zones = [
  ['room1', 'Room 1', 'z-room1', 'zone-room1'],
  ['room2', 'Room 2', 'z-room2', 'zone-room2'],
  ['room3', 'Room 3', 'z-room3', 'zone-room3'],
  ['room4', 'Room 4', 'z-room4', 'zone-room4'],
  ['hall', 'Hall', 'z-hall', 'zone-hall'],
]

async function show(id, name) {
  errorMessage.value = ''
  title.value = name
  const data = await loadJSON(`api/rooms/${id}/sessions.json`, 'Could not load sessions for this room. Please try again.')
  if (!data) return
  sessions.value = data
  open.value = true
}

function close() {
  open.value = false
}
</script>

<template>
  <section>
    <div class="map">
      <button v-for="zone in zones" :key="zone[0]" type="button" class="zone w-full" :class="zone[2]" :data-testid="zone[3]" @click="show(zone[0], zone[1])">{{ zone[1] }}</button>
      <div class="zone z-public">Public Area</div>
      <div class="zone z-road">Road Show</div>
      <div class="zone z-entr">Entrance</div>
      <div class="zone z-shop">Shop</div>
      <div class="zone z-rest">Restaurant</div>
      <div class="zone corr-h">Corridor</div>
      <div class="zone corr-v">Corridor</div>
    </div>

    <div class="backdrop" :class="{ open }" @click="close"></div>
    <section class="sheet" :class="{ open }" data-testid="room-modal">
      <header class="flex items-center justify-between">
        <h2 class="text-lg font-bold">{{ title }}</h2>
        <button type="button" class="rounded-full bg-slate-900 px-3 py-2 text-sm text-white" data-testid="modal-close-btn" @click="close">Done</button>
      </header>
      <p v-for="session in sessions" :key="session.id">
        <strong>{{ session.title }}</strong>
        {{ session.speaker }} · {{ session.time }} · Day {{ session.day }}
        <RoomDot :room="session.room" />
      </p>
    </section>
  </section>
</template>
