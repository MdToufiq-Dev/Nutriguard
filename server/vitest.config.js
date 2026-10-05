import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: ['./src/tests/globalSetup.js'],
    include: ['src/**/*.test.js'],
    env: {
      NODE_ENV: 'test',
    },
  },
});
