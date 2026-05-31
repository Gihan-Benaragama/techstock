import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    strictPort: true
  }
});
