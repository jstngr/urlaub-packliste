import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Custom domain urlaub.clapt.de serves at root, so assets resolve from '/'.
export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
