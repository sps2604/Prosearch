import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Look for test files in the e2e directory
    include: ['src/e2e/**/*.test.ts'],
    // Set a longer timeout for E2E tests, as they can be slow.
    testTimeout: 60000, // 60 seconds
    hookTimeout: 60000,
  },
});