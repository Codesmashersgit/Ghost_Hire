import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // SSE streaming route — must NOT buffer the response
      '/api/ai/chat': {
        target: 'https://ghost-hire-uyn2.onrender.com',
        changeOrigin: true,
        secure: false,
        // Disable response buffering so SSE chunks pass through immediately
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.error('[Vite Proxy] /api/ai/chat error:', err.message);
          });
          proxy.on('proxyRes', (proxyRes) => {
            // Forward the no-buffering header downstream
            proxyRes.headers['x-accel-buffering'] = 'no';
          });
        },
      },
      // All other API routes (auth, sessions, usage, etc.)
      '/api': {
        target: 'https://ghost-hire-uyn2.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Vite Proxy] /api error:', err.message);
          });
        },
      },
    },
  },
})
