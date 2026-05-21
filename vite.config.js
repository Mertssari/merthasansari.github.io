import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/hero3d.jsx',
      formats: ['es'],
      fileName: () => 'hero3d.js'
    },
    outDir: 'dist',
    emptyOutDir: false
  }
})
