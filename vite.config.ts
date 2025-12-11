import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
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
        rollupOptions: {
            // Make sure to NOT externalize React/ReactDOM because we want them bundled 
            // so the widget works on pages without React.
            // However, this might make the bundle file large. 
            // For a "popup chat icon" usually we want it standalone.
            output: {
                // Ensure styles are injected or handled
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') return 'numbers-consulting-widget.css';
                    return assetInfo.name as string;
                },
            }
        },
        // cssCodeSplit: false // Force CSS into one file? Or let it be injected?
        // With library mode, Vite usually verifies CSS. 
      }
    };
});
