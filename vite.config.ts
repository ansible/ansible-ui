import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
// import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svgr({ exportAsDefault: true }),
    react(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}', 'assets/**/*', 'locales/**/*'],
    //     maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
    //   },
    //   manifest: {
    //     name: 'Ansible',
    //     short_name: 'Ansible',
    //     description: 'Ansible',
    //     theme_color: '#000000',
    //     icons: [
    //       {
    //         src: 'icon-192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //         purpose: 'any',
    //       },
    //       {
    //         src: 'icon-512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any',
    //       },
    //       {
    //         src: 'maskable-192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //         purpose: 'maskable',
    //       },
    //       {
    //         src: 'maskable-512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'maskable',
    //       },
    //     ],
    //   },
    // }),
  ],
  server: {
    open: true,
    port: 3002,
    cors: false,
    proxy: {
      '/api': {
        target: 'https://localhost:3001',
        secure: false,
      },
      '/websocket': {
        target: 'https://localhost:3001',
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 10 * 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor', 'monaco-yaml'],
        },
      },
    },
  },
});
