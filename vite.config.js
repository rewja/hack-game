import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            input: {
                main: './index.html'
            }
        }
    },
    server: {
        port: 3000,
        open: true,
        host: true, // Allow external connections
        strictPort: false // Try next available port if 3000 is taken
    }
});

