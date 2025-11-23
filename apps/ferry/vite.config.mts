import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(async () => {
  const { default: tailwindcss } = await import('@tailwindcss/vite' as string);

  // Support subdirectory hosting via BASE_PATH environment variable
  // Default to "/" for root hosting (GCS bucket root)
  // Can be set to "/subdirectory/" for subdirectory hosting
  const base = process.env.BASE_PATH || '/';

  // Plugin to update base tag and asset paths in HTML
  const baseTagPlugin = () => ({
    name: 'html-base-tag',
    transformIndexHtml(html: string) {
      let transformed = html.replace(/<base href="[^"]*" \/>/, `<base href="${base}" />`);
      
      // If base is not root, update asset paths to use base path
      if (base !== '/') {
        // Update script and link tags with absolute paths to use base path
        transformed = transformed.replace(
          /(href|src)="\/(assets\/[^"]+)"/g,
          `$1="${base}$2"`
        );
      }
      
      return transformed;
    },
  });

  return {
    base,
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
    plugins: [react(), tailwindcss(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md']), baseTagPlugin()],
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
      // Use relative paths for assets to support subdirectory hosting
      assetsDir: 'assets',
      // Ensure assets use the base path
      rollupOptions: {
        output: {
          // This ensures assets are referenced relative to base
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
        },
      },
    },
  };
});
