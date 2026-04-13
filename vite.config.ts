// File: vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // O proxy agora aponta para a URL correta do backend FastAPI 'http://146.19.9.149:8000'
      '/api': {
        target: 'https://vidgen.dsantosinfo.com.br', 
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log(`Sending Request to the Target:`, req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
   // Adicionado para otimizar dependências
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});