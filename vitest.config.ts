import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const src = fileURLToPath(new URL('./src', import.meta.url));
const content = fileURLToPath(new URL('./content', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@content\//, replacement: `${content}/` },
      { find: /^@\//, replacement: `${src}/` },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'content/**/*.test.ts'],
    passWithNoTests: true,
  },
});
