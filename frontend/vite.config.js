import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Electron loads the packaged app using the file:// protocol.  Absolute
  // asset URLs (the Vite default) point at the filesystem root there, so the
  // renderer never loads its JS/CSS and the window stays blank.
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
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
