import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      // build against this repository's source rather than the package published on npm
      'react-tournament-bracket': fileURLToPath(new URL('../src/index.ts', import.meta.url))
    },
    // the library source resolves react from the root node_modules, and there must be only one copy at runtime
    dedupe: [ 'react', 'react-dom' ]
  },
  build: {
    rolldownOptions: {
      // the bundler reports some code that will crash at runtime as a warning, and still calls the build a success
      onwarn(warning) {
        throw new Error(warning.message);
      }
    }
  },
  server: {
    fs: {
      allow: [ '..' ]
    }
  }
});
