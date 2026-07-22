import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base is set to the GitHub Pages repo path in Task 13.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
