import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base = GitHub Pages repo path so asset URLs resolve under /urlaub-packliste/.
export default defineConfig({
  base: '/urlaub-packliste/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
