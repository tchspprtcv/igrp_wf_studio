import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Explicitly enable Fast Refresh
      //fastRefresh: true,
      // Include runtime configuration
      jsxRuntime: 'automatic',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Ensure proper HMR handling
    hmr: true,
    // Add proper host configuration
    host: true,
  },
  optimizeDeps: {
    exclude: ['igrp-wf-engine'],
    include: ['debug']
  },
});