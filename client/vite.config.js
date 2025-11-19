import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    charset: 'utf8',
    // Supprimer tous les console.log en production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Retire tous les console.log/warn/error
        drop_debugger: true, // Retire tous les debugger
        pure_funcs: ['console.log', 'console.info', 'console.debug'] // Liste spécifique
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation-vendor': ['framer-motion'],
          'ui-vendor': ['lucide-react', 'emoji-picker-react'],
        },
      },
    },
  },
})
