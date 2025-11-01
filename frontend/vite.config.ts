import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/examples/',
  plugins: [react()],
  resolve: {
    alias: {
      '@mui/material': '/src/mui/material.tsx',
    },
  },
})
