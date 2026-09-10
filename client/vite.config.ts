import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const proxyTarget = process.env.VITE_DEV_PROXY_TARGET ?? 'http://localhost:4000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
      '/socket.io': {
        target: proxyTarget,
        ws: true,
      },
    },
  },
})
