import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5000,
    open: true,
  },
  preview: {
    port: 5000,
  },
  plugins: [
    eslintPlugin(),
    tsconfigPaths(),
    checker({
      typescript: true,
    }),
    react(),
  ],
});
