import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Separate config for building the embeddable widget
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        lib: {
            entry: path.resolve(__dirname, 'widget.tsx'),
            name: 'NumbersConsultingWidget',
            fileName: (format) => `numbers-consulting-widget.${format}.js`
        },
        outDir: 'dist-widget',
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') return 'numbers-consulting-widget.css';
                    return assetInfo.name as string;
                },
            }
        }
      }
    };
});
