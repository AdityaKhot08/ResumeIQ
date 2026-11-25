import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    // Keep the initial bundle lean by splitting heavy, stable dependencies.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/](recharts|d3-[^\\/]+|victory-vendor)[\\/]/.test(id)) return 'charts';
          if (id.includes('lucide-react')) return 'icons';
          if (/[\\/](react-router|@remix-run)[\\/]/.test(id)) return 'router';
          if (id.includes('axios')) return 'http';
          if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
          return 'vendor';
        },
      },
    },
  },
});
