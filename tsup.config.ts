import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: 'dist',
  },
  {
    entry: ['src/cli/index.ts'],
    format: ['esm'],
    banner: { js: '#!/usr/bin/env node' },
    sourcemap: true,
    outDir: 'dist/cli',
  },
])
