import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/stores/**', 'src/components/**'],
      exclude: [
        '**/__tests__/**',
        '**/*.test.*',
        '**/test-setup.ts',
        'src/components/Canvas/**'  // Fabric.js requires real browser — covered by E2E
      ],
      thresholds: {
        statements: 80,
        branches: 55,
        functions: 70,
        lines: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@electron': resolve(__dirname, 'electron')
    }
  }
})
