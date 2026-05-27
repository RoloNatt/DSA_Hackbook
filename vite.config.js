import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages: set base to "/<repo-name>/"
// If you use a custom domain, change this to "/"
export default defineConfig({
  plugins: [react()],
  base: '/dsa-cheat-sheet/',
});
