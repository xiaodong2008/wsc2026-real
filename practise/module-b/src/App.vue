<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <main class="card">
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>

    <RouterView />
  </main>
</template>

<style>
:root { color-scheme: dark; }
body { font-family: system-ui, sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b1020; color: #e7ecff; }
.card { background: #151c33; padding: 2.5rem 3rem; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,.4); max-width: 32rem; }
.v { color: #42b883; }
code { background: #0b1020; padding: .15rem .4rem; border-radius: 6px; }
nav { display: flex; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #26304d; }
nav a { color: #9aa6c8; text-decoration: none; font-weight: 600; }
nav a:hover { color: #e7ecff; }
nav a.router-link-active { color: #42b883; }
button { font-size: 1rem; padding: .6rem 1.2rem; border-radius: 8px; border: 0; background: #42b883; color: #0b1020; font-weight: 600; cursor: pointer; }
</style>
