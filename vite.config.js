import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const isVercel = process.env.VERCEL === '1';

export default defineConfig({
  plugins: [react()],
  base: isVercel ? '/' : process.env.NODE_ENV === 'production' ? '/KingsEdgeMobilisationPlan/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        investmentCase: fileURLToPath(new URL('./investment-case.html', import.meta.url))
      }
    }
  }
});
