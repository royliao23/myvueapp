import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '', // Set base to empty for relative paths
  plugins: [vue()],
})
