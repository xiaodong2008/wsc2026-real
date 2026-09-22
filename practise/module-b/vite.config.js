import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { host: true, port: 80, strictPort: true, allowedHosts: ['.skill17.com'] },
})
