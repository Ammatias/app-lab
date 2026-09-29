import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const hmrHost = process.env.VITE_HMR_HOST || ''
const hmrProtocol = process.env.VITE_HMR_PROTOCOL || 'wss'
const hmrClientPort = Number.parseInt(process.env.VITE_HMR_CLIENT_PORT || '443', 10)

export default defineConfig({
  appType: 'spa',
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Чтобы работал внутри Docker
    port: 4173,      // В docker-compose сейчас используется 4173
    strictPort: true,
    watch: {
      usePolling: true, // Включает Hot Reload (HMR) при пробросе через volume (напр. NAS)
      interval: 1000
    },
    hmr: hmrHost
      ? {
          host: hmrHost,
          protocol: hmrProtocol,
          clientPort: hmrClientPort
        }
      : undefined,
    allowedHosts: ['localhost', 'all'],
    proxy: {
      '/api': {
        target: 'http://itportal-backend:8000',
        changeOrigin: true,
      }
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    allowedHosts: ['localhost']
  }
})
