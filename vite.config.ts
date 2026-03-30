import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: process.env.VITE_API_URL || 'http://localhost:5000',
            changeOrigin: true,
            secure: false
          }
        }
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['logo.png', 'robots.txt', 'apple-touch-icon.png'],
          manifest: {
            name: 'WhatsCloud OS',
            short_name: 'WhatsCloud',
            description: 'SaaS Platform for Lead Scraping and AI Agents',
            theme_color: '#0F172A',
            background_color: '#0F172A',
            display: 'standalone',
            icons: [
              {
                src: 'logo.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'logo.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'logo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          },
          workbox: {
            navigateFallbackDenylist: [/^\/api/]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
