import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/quest-hq-command-center/' : '/',
  define: {
    __QUEST_BUILD_SHA__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || 'development'),
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@supabase')) return 'vendor-supabase';
          return undefined;
        },
      },
    },
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
});
