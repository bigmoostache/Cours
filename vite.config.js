import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import yaml from '@modyfi/vite-plugin-yaml';

export default defineConfig({
  plugins: [react(), yaml()],
  base: process.env.NODE_ENV === 'production' ? '/Cours/' : '/',
});
