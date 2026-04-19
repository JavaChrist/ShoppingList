import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'apple-touch-icon-3d.png'],
      manifest: {
        name: 'Ma Liste de Courses',
        short_name: 'Liste',
        description: 'Liste de courses partagée en temps réel',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'logo16.png',  sizes: '16x16',   type: 'image/png' },
          { src: 'logo32.png',  sizes: '32x32',   type: 'image/png' },
          { src: 'logo48.png',  sizes: '48x48',   type: 'image/png' },
          { src: 'logo64.png',  sizes: '64x64',   type: 'image/png' },
          { src: 'logo96.png',  sizes: '96x96',   type: 'image/png' },
          { src: 'logo128.png', sizes: '128x128', type: 'image/png' },
          { src: 'logo192.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo256.png', sizes: '256x256', type: 'image/png' },
          { src: 'logo384.png', sizes: '384x384', type: 'image/png' },
          { src: 'logo512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  }
})
