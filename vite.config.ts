import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: 'examples/lab',
  plugins: [react(), tailwind()],
  resolve: { alias: { '@': fileURLToPath(new URL('./assets', import.meta.url)) } },
  server: { port: 4173, strictPort: true, fs: { allow: ['../..'] } },
  build: { outDir: '../../dist', emptyOutDir: true },
});
