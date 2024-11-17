import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
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
