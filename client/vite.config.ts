import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';
import eslintPlugin from '@nabla/vite-plugin-eslint';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5000,
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
