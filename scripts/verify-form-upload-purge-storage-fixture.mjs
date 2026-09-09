import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { runFormUploadPurge } from '../api/form-upload-purge.js';
import { FORM_FILE_BUCKET } from '../api/_lib/form-files.js';

const EXPECTED_PROJECT_REF = 'rqundirizvojpzhljtdn';
const RUN_FLAG = '--live-storage-fixture';

function configuredValue(...names) {
  return names.map((name) => process.env[name]).find(Boolean) || '';
}

function fail(code) {
  console.error(JSON.stringify({ form_upload_purge_fixture: 'not_run', code }));
  process.exitCode = 1;
}

if (!process.argv.includes(RUN_FLAG)) {
  fail('explicit_flag_required');
} else {
  const url = configuredValue('SUPABASE_URL', 'VITE_SUPABASE_URL');
  const serviceKey = configuredValue('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY');
  let projectRef = '';
  try { projectRef = new URL(url).hostname.split('.')[0]; } catch { /* handled below */ }

  if (!url || !serviceKey) {
    fail('service_configuration_required');
  } else if (projectRef !== EXPECTED_PROJECT_REF) {
    fail('unexpected_project_ref');
  } else {
    const client = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const prefix = `__qa_form_upload_purge/${randomUUID()}`;
    const target = `${prefix}/target.txt`;
    const control = `${prefix}/control.txt`;
    const bucket = client.storage.from(FORM_FILE_BUCKET);
    let created = 0;
    let cleanupError = false;

    try {
      const targetUpload = await bucket.upload(target, Buffer.from('form-upload-purge-fixture'), {
        contentType: 'text/plain', upsert: false,
      });
      if (targetUpload.error) throw new Error('target_fixture_upload_failed');
      created += 1;

      const controlUpload = await bucket.upload(control, Buffer.from('form-upload-purge-control'), {
        contentType: 'text/plain', upsert: false,
      });
      if (controlUpload.error) throw new Error('control_fixture_upload_failed');
      created += 1;

      // Deliberately bypasses expired-intent housekeeping: this is a narrow Storage boundary
      // probe, not a production cron run. The RPC wrapper supplies only the fixture candidate.
      const fixtureClient = {
        from: client.from.bind(client),
        storage: client.storage,
        rpc(name, args) {
          if (name === 'abandoned_form_uploads') return Promise.resolve({ data: [{ object_path: target }], error: null });
          return client.rpc(name, args);
        },
      };
      const outcome = await runFormUploadPurge(fixtureClient, { skipExpiredIntentCleanup: true });
      if (outcome.status !== 'success' || outcome.selected !== 1 || outcome.deleted !== 1) {
        throw new Error('fixture_cleanup_not_confirmed');
      }

      const targetInfo = await bucket.info(target);
      const controlInfo = await bucket.info(control);
      if (!targetInfo.error || controlInfo.error) throw new Error('fixture_storage_assertion_failed');

      console.log(JSON.stringify({
        form_upload_purge_fixture: 'passed',
        fixtures_created: created,
        selected: outcome.selected,
        deleted: outcome.deleted,
        target_absent: 1,
        control_present: 1,
      }));
    } catch (error) {
      // Do not print provider errors: they can contain paths, URLs, or request details.
      console.error(JSON.stringify({
        form_upload_purge_fixture: 'failed',
        fixtures_created: created,
        code: error?.message || 'unexpected_failure',
      }));
      process.exitCode = 1;
    } finally {
      // Exact, generated fixture paths only. This is intentionally not a prefix delete.
      try {
        const cleanup = await bucket.remove([target, control]);
        if (cleanup.error) throw new Error('fixture_cleanup_failed');
      } catch {
        cleanupError = true;
        console.error(JSON.stringify({ form_upload_purge_fixture: 'cleanup_failed', fixtures_created: created }));
        process.exitCode = 1;
      }
    }

    if (cleanupError) process.exitCode = 1;
  }
}
