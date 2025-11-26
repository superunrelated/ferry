import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function githubPages404Plugin() {
  return {
    name: 'github-pages-404',
    closeBundle() {
      const outDir = resolve(__dirname, '../../dist/apps/ferry');
      const indexPath = join(outDir, 'index.html');
      const notFoundPath = join(outDir, '404.html');
      
      try {
        const indexContent = readFileSync(indexPath, 'utf-8');
        writeFileSync(notFoundPath, indexContent);
      } catch (error) {
        console.warn('Failed to create 404.html:', error);
      }
    },
  };
}

export default defineConfig(async () => {
  const { default: tailwindcss } = await import('@tailwindcss/vite' as string);

  return {
    base: '/',
    root: import.meta.dirname,
    cacheDir: '../../node_modules/.vite/apps/ferry',
    server: {
      port: 4200,
      host: 'localhost',
    },
    preview: {
      port: 4200,
      host: 'localhost',
    },
    plugins: [react(), tailwindcss(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md']), githubPages404Plugin()],
    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },
    build: {
      outDir: '../../dist/apps/ferry',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
        },
      },
    },
  };
});
