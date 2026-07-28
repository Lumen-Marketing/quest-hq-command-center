import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/quest-hq-command-center/' : '/',
  define: {
    // The fallback is a 40-character placeholder, not a short word, so a local
    // build measures the same bundle size as a deployed one. With 'development'
    // (11 chars) the entry chunk came out ~33 gzip bytes smaller than production,
    // which let the bundle-budget gate pass locally and then fail the deploy.
    // Must be high-entropy hex, not a repeated character: gzip crushes a run of
    // identical bytes to almost nothing, so '0'.repeat(40) measured the same as the
    // old short word and defeated the point.
    __QUEST_BUILD_SHA__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || 'a3f5c81d94b2e07f6c15d8a29b34e7016f8c2d5b'),
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
