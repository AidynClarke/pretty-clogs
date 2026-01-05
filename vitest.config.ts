import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    reporters: ['default', ['junit', {outputFile: './coverage/junit.xml'}]],
    coverage: {
      reporter: ['text', 'text-summary', 'cobertura'],
      include: ['src/**/*.ts'],
      exclude: ['**/node_modules/**']
    }
  }
})