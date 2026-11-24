import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const src = fileURLToPath(new URL('./src', import.meta.url));
const content = fileURLToPath(new URL('./content', import.meta.url));
const rootParamsStub = fileURLToPath(new URL('./test-stubs/root-params.ts', import.meta.url));
const serverOnlyStub = fileURLToPath(new URL('./test-stubs/server-only.ts', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      // Unit tests import server modules directly; the real package throws outside the RSC graph.
      { find: /^server-only$/, replacement: serverOnlyStub },
      { find: /^next\/root-params$/, replacement: rootParamsStub },
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
