import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente baseado no modo
  const env = loadEnv(mode, process.cwd(), '');
  
  // Configuração de portas baseada no ambiente
  const isDevelopment = mode === 'development';
  const frontendPort = isDevelopment ? 3001 : 4000;
  const backendPort = isDevelopment ? 3002 : 4001;
  
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
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit instead of 2MB
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
      port: frontendPort, // 3001 em dev, 4000 em produção
      strictPort: true, // Força o uso da porta específica, falha se ocupada
      proxy: {
        '/api': {
          target: env.VITE_API_URL || env.VITE_SERVER_URL || `http://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    preview: {
      host: '0.0.0.0',
      port: frontendPort, // Mesma porta para preview
      strictPort: true, // Força o uso da porta específica, falha se ocupada
    },
    hmr: {
      protocol: 'wss',
      host: 'developer.smartlogger.io',
      clientPort: 443,
    },
    build: {
      outDir: mode === 'production' ? 'dist' : 'build',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            charts: ['chart.js', 'react-chartjs-2', 'recharts'],
            ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
            utils: ['axios', 'sweetalert2', 'react-toastify'],
          }
        }
      },
      chunkSizeWarningLimit: 1000, // Aumenta o limite de warning para 1MB
    },
  };
});
