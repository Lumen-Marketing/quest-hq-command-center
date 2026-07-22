// Supabase Storage seam. `ctx.db` is a raw PostgREST fetch and cannot mint
// signed upload/download URLs, so the two public-form file endpoints need a
// real supabase-js client. Base URL and key come from _lib/supabase-admin.js
// so the env resolution can never drift from the admin fetch.
//
// Handlers use `ctx.storage || createStorageClient()`, matching the
// ctx.smsSend idiom: a real default in production, a fake in tests.

import { createClient } from '@supabase/supabase-js';
import { supabaseBaseUrl, supabaseServiceKey } from './supabase-admin.js';

export function createStorageClient() {
  return createClient(supabaseBaseUrl(), supabaseServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
