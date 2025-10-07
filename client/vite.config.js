import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // local flask route
        // target: 'http://localhost:5555',
        // gunicorn production route
        target: 'http://localhost:8000'
      }
    }
  }
})