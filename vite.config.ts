/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/data\/problems-v\d+\.json/,
            handler: 'NetworkFirst',
            options: { cacheName: 'problems-data' },
          },
          {
            urlPattern: /\/images\/.*\.(png|jpg|jpeg|svg|webp)/,
            handler: 'CacheFirst',
            options: { cacheName: 'images-cache' },
          },
          {
            urlPattern: /\/generated\/.*\.svg/,
            handler: 'CacheFirst',
            options: { cacheName: 'generated-svg-cache' },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-webfonts' },
          },
        ],
      },
      manifest: {
        name: 'I Do Math',
        short_name: 'I Do Math',
        description: '초등학생을 위한 수학 학습 앱',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: {
    host: true,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'lottie-web': 'lottie-web/build/player/lottie_light.js',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-lottie': ['lottie-react', 'lottie-web'],
          'vendor-db': ['dexie', 'dexie-react-hooks'],
        },
      },
    },
  },
})
