/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => ({
  root: __dirname || import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/apps/front/main',
  server: {
    port: process.env.MAIN_PORT ? Number(process.env.MAIN_PORT) : 3000,
    host: '0.0.0.0',
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  preview: {
    port: process.env.MAIN_PORT ? Number(process.env.MAIN_PORT) : 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md']), tailwindcss()],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../../dist/apps/front/main',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
