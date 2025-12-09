import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*'],
      manifest: {
        name: 'Moon Landing',
        short_name: 'MoonLanding',
        description: 'Step-by-step lunar landing game built with Vue 3',
        theme_color: '#020516',
        background_color: '#020516',
        display: 'standalone',
        icons: [
          { src: 'icons/pwa-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icons/pwa-512.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      }
    })
  ],

  server: {
    host: '0.0.0.0',  // или true, или 'localhost'
    port: 5173,
    strictPort: false, // если порт занят, попробует другой
    open: true,        // автоматически открыть браузер при запуске
    cors: true,        // разрешить CORS
    
    // Опционально: настройка прокси для API
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3000',
    //     changeOrigin: true
    //   }
    // }
  },
  
  // 👇 Опционально: для production сборки
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000
  }
})
