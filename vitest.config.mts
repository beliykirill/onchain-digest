import path from 'node:path';
import { defineConfig } from 'vitest/config';

const src = (dir: string) => path.resolve(import.meta.dirname, 'src', dir);

export default defineConfig({
  resolve: {
    alias: {
      widgets: src('widgets'),
      features: src('features'),
      shared: src('shared'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
