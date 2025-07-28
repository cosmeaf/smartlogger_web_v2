import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'SmartLogger Web',
          short_name: 'SmartLogger',
          description: 'Sistema de monitoramento inteligente para equipamentos industriais',
          theme_color: '#2563eb',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'any',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icon-192x192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'maskable any'
            },
            {
              src: '/icon-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'maskable any'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    server: {
      host: '0.0.0.0',
      port: process.env.VITE_PORT || 3001,
    },
    hmr: {
      protocol: 'wss',
      host: 'developer.smartlogger.io',
      clientPort: 443,
    },
    build: {
      outDir: mode === 'production' ? 'dist' : 'build',
    },
  };
});
