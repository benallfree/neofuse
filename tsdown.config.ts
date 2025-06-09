/// <reference types="node" />
import fs from 'fs'
import path from 'path'
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm'],
  dts: {
    sourcemap: true,
  },
  sourcemap: true,
  outDir: 'dist',
  clean: true,
  onSuccess: () => {
    const prebuildsDir = path.join(__dirname, 'prebuilds')
    const distPrebuildsDir = path.join(__dirname, 'dist', 'prebuilds')

    if (fs.existsSync(prebuildsDir)) {
      fs.cpSync(prebuildsDir, distPrebuildsDir, { recursive: true })
    }
    console.log('Build successful')
  },
})
