<script setup>
import { computed, onMounted, ref } from 'vue'
import { FRAMES } from '../lib/frames.js'

const designId = ref('bands')
const ratio = ref('normal')
const hint = ref('')
const canvas = ref(null)
let userImg = null
let frameImg = null

const design = computed(() => FRAMES.find((item) => item.id === designId.value))

function drawCover(ctx, img, width, height) {
  const scale = Math.max(width / img.width, height / img.height)
  const w = img.width * scale
  const h = img.height * scale
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h)
}

function redraw() {
  if (!frameImg || !canvas.value) return
  const width = frameImg.naturalWidth
  const height = frameImg.naturalHeight
  const ctx = canvas.value.getContext('2d')
  canvas.value.width = width
  canvas.value.height = height
  if (userImg) drawCover(ctx, userImg, width, height)
  ctx.drawImage(frameImg, 0, 0, width, height)
}

async function loadFrame() {
  const src = ratio.value === 'wide' ? design.value.wide : design.value.normal
  if (!src) return
  const img = new Image()
  img.src = src
  await img.decode()
  frameImg = img
  redraw()
}

function selectDesign(id) {
  const frame = FRAMES.find((item) => item.id === id)
  designId.value = id
  if (ratio.value === 'normal' && !frame.normal) ratio.value = 'wide'
  if (ratio.value === 'wide' && !frame.wide) ratio.value = 'normal'
  loadFrame()
}

function selectRatio(next) {
  if (next === 'normal' && !design.value.normal) return
  if (next === 'wide' && !design.value.wide) return
  ratio.value = next
  loadFrame()
}

function onFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const img = new Image()
  img.onload = () => {
    userImg = img
    URL.revokeObjectURL(img.src)
    redraw()
  }
  img.src = URL.createObjectURL(file)
  event.target.value = ''
}

function stamp14() {
  const date = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
}

function fileName() {
  return `worldskills-shanghai-2026-${stamp14()}.png`
}

function toBlob() {
  return new Promise((resolve) => canvas.value.toBlob(resolve, 'image/png'))
}

async function downloadBlob(blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName()
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function onDownload() {
  const blob = await toBlob()
  if (blob) await downloadBlob(blob)
}

async function onShare() {
  const blob = await toBlob()
  if (!blob) return
  const file = new File([blob], fileName(), { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: 'WorldSkills Shanghai 2026',
        text: 'My conference photo souvenir!',
        files: [file],
      })
    } catch (err) {
      if (err.name === 'AbortError') {
        hint.value = 'Sharing was not completed. Use Download to save the image.'
        return
      }
      await downloadBlob(blob)
    }
  } else {
    await downloadBlob(blob)
  }
}

onMounted(loadFrame)
</script>

<template>
  <section>
    <label class="grid gap-1.5 font-bold">
      Choose photo
      <input data-testid="photo-upload" type="file" accept="image/*" @change="onFile" />
    </label>
    <canvas ref="canvas" class="my-3 block h-auto max-w-full bg-slate-200"></canvas>
    <h2 class="mt-3 mb-2 text-sm font-semibold">Frame</h2>
    <div class="flex flex-wrap gap-2">
      <button v-for="frame in FRAMES" :key="frame.id" type="button" class="rounded-full px-3 py-2 text-sm" :class="designId === frame.id ? 'bg-blue-600 text-white' : 'bg-white'" @click="selectDesign(frame.id)">{{ frame.label }}</button>
    </div>
    <h2 class="mt-3 mb-2 text-sm font-semibold">Ratio</h2>
    <div class="flex flex-wrap gap-2">
      <button type="button" class="rounded-full px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40" data-testid="ratio-normal" :disabled="!design.normal" :class="ratio === 'normal' ? 'bg-blue-600 text-white' : 'bg-white'" @click="selectRatio('normal')">Normal</button>
      <button type="button" class="rounded-full px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40" data-testid="ratio-wide" :disabled="!design.wide" :class="ratio === 'wide' ? 'bg-blue-600 text-white' : 'bg-white'" @click="selectRatio('wide')">Wide</button>
    </div>
    <div class="mt-3 flex flex-wrap gap-2">
      <button type="button" class="rounded-full bg-slate-900 px-3 py-2 text-sm text-white" data-testid="download-btn" @click="onDownload">Download</button>
      <button type="button" class="rounded-full bg-slate-900 px-3 py-2 text-sm text-white" data-testid="share-btn" @click="onShare">Share</button>
    </div>
    <p v-if="hint" class="mt-2">{{ hint }}</p>
  </section>
</template>
