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
      'igrp-wf-engine': path.resolve(__dirname, '../igrp-wf-engine/src'), // Or path.resolve(__dirname, '../igrp-wf-engine/dist/esm') if using built files
    },
  },
  server: {
    // Ensure proper HMR handling
    // Add proper host configuration
    host: true,
    // Allow all hosts for development
    cors: true,
    strictPort: false,

  },
  optimizeDeps: {
    exclude: []
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        format: 'es'
      }
    }
  },
});
