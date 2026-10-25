import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { evidence } from './scripts/vite-plugin-evidence.ts'

const buildDate = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Sydney',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date())

export default defineConfig({
  plugins: [react(), evidence()],
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  build: {
    target: 'es2022',
  },
})
