import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node';
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
// import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
  plugins: [
    react(),
    rollupNodePolyFill() // add polyfill plugin for rollup
  ],
  define: {
    global: 'globalThis' // polyfill global variable
  },
  // optimizeDeps: {
  //   esbuildOptions: {
  //     // Define global variable for esbuild
  //     define: {
  //       global: 'globalThis'
  //     },
  //     plugins: [
  //       NodeGlobalsPolyfillPlugin({
  //         process: true,
  //         buffer: true,
  //       }),
  //       NodeModulesPolyfillPlugin()
  //     ]
  //   }
  // },
  // build: {
  //   rollupOptions: {
  //     plugins: [
  //       rollupNodePolyFill() // also include in build
  //     ]
  //   }
  // }
});
