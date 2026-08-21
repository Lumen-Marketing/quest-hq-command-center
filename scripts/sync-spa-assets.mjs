import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

// Keep in lockstep with LEGACY_ROUTE_SECTIONS in src/main.js. These static stubs
// and the SPA's own legacy normalizer must resolve a given .html path to the same
// section — a host that serves the stub and one that falls through to 404.html
// (the SPA) would otherwise land the same link on two different pages.
const legacyFiles = [
    'admin.html',
    'automations.html',
    'calendar.html',
    'crm.html',
    'dashboards.html',
    'files.html',
    'finance.html',
    'forms.html',
    'jobs.html',
    'knowledge.html',
    'login.html',
    'messages.html',
    'task-management.html',
    'templates.html',
    'tickets.html',
    'underwriter.html',
];

export async function syncSpaAssets(outDirArg = 'dist') {
    const outDir = path.resolve(outDirArg);
    const taskRuntimeSource = path.join(root, 'taskmanagement');
    const taskRuntimeTarget = path.join(outDir, 'taskmanagement');
    const taskSupabaseSource = path.join(
        root,
        'node_modules',
        '@supabase',
        'supabase-js',
        'dist',
        'umd',
        'supabase.js',
    );
    const taskSupabaseTarget = path.join(
        taskRuntimeTarget,
        'vendor',
        'supabase',
        'supabase.js',
    );
    const faviconSource = path.join(root, 'favicon.svg');
    const faviconDarkSource = path.join(root, 'favicon-dark.svg');

    await rm(taskRuntimeTarget, { recursive: true, force: true });
    await cp(taskRuntimeSource, taskRuntimeTarget, { recursive: true });
    // Tasks is copied as a standalone static app, so Vite does not bundle its
    // scripts. Ship Supabase's browser build on our own origin instead of
    // relying on jsDelivr, which the production script-src 'self' policy blocks.
    await mkdir(path.dirname(taskSupabaseTarget), { recursive: true });
    await cp(taskSupabaseSource, taskSupabaseTarget);
    await cp(faviconSource, path.join(outDir, 'favicon.svg'));
    // index.html references both; shipping only one means a 404 for every visitor
    // whose browser prefers a dark colour scheme.
    await cp(faviconDarkSource, path.join(outDir, 'favicon-dark.svg'));

    // The vendored task module reads its Supabase connection from env.json. Write
    // it from the SAME env vars the host build uses so the two apps can never point
    // at different projects — if they do, they hold different login sessions on one
    // origin and the embedded module bounces to the host login forever.
    // Defaults mirror src/main.js CONFIG; publishable/anon key only, never a secret.
    // Trimmed, every one of them. A value pasted into a hosting dashboard picks up a
    // trailing newline easily and it is invisible in the UI. It then rides into env.json as
    // part of the string: REST survives it, but Realtime puts the key in the WebSocket query
    // string where it becomes a literal %0A and the server returns 401. Production shipped
    // exactly that until 2026-08-04 -- every request worked and only the socket failed.
    const env = (name, fallback) => String(process.env[name] || fallback).trim();
    const taskRuntimeEnv = {
        supabaseUrl: env('VITE_SUPABASE_URL', 'https://rqundirizvojpzhljtdn.supabase.co'),
        supabaseAnonKey: env('VITE_SUPABASE_ANON_KEY', 'sb_publishable_2WrlRVv2obg2N5g7ifl7Rg_wxGjs29U'),
        sentryDsn: env('VITE_SENTRY_DSN', ''),
        release: env('VERCEL_GIT_COMMIT_SHA', ''),
        turnstileSiteKey: env('VITE_TURNSTILE_SITE_KEY', ''),
    };
    if (/^sb_secret_|service_role/i.test(taskRuntimeEnv.supabaseAnonKey)) {
        throw new Error('Refusing to write a service-role key into taskmanagement/env.json.');
    }
    await writeFile(
        path.join(taskRuntimeTarget, 'env.json'),
        `${JSON.stringify(taskRuntimeEnv, null, 2)}\n`,
        'utf8',
    );

    const indexHtml = await readFile(path.join(outDir, 'index.html'), 'utf8');
    await writeFile(path.join(outDir, '404.html'), indexHtml);
    await writeFile(path.join(outDir, '.nojekyll'), '');

    await Promise.all(
        legacyFiles.map((file) => writeFile(path.join(outDir, file), legacyRedirect(file), 'utf8'))
    );
}

if (
    import.meta.url === pathToFileURL(process.argv[1]).href) {
    await syncSpaAssets(process.argv[2] || 'dist');
}

function legacyRedirect(file) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Opening Questbase</title>
    <script>
      (function () {
        var file = ${JSON.stringify(file)};
        var params = new URLSearchParams(window.location.search);
        var company = params.get('company_id') || params.get('company') || localStorage.getItem('quest-hq-active-company') || 'roofing';
        var route = '/company/' + encodeURIComponent(company) + '/jobs';
        function workspace(section) {
          return '/company/' + encodeURIComponent(company) + '/' + section;
        }
        function keep(keys) {
          var next = new URLSearchParams();
          keys.forEach(function (key) {
            if (params.has(key)) next.set(key, params.get(key));
          });
          return next;
        }
        var map = {
          'admin.html': workspace('settings'),
          'automations.html': workspace('automations'),
          'calendar.html': workspace('calendar'),
          'crm.html': workspace('crm'),
          'dashboards.html': workspace('analytics'),
          'files.html': workspace('files'),
          'finance.html': workspace('finance'),
          'forms.html': workspace('forms'),
          'jobs.html': workspace('jobs'),
          'knowledge.html': workspace('knowledge'),
          'login.html': '/login',
          'messages.html': workspace('messages'),
          'templates.html': workspace('templates'),
          'tickets.html': workspace('tickets'),
          'underwriter.html': workspace('underwriter')
        };
        if (file === 'task-management.html') {
          route = workspace('tasks');
          if (params.has('project_id') && !params.has('job_id')) params.set('job_id', params.get('project_id'));
          if (params.has('workspace_id') && !params.has('workspace')) params.set('workspace', params.get('workspace_id'));
          if (params.get('new') !== '1') params.delete('new');
          if (params.get('edit') !== '1') params.delete('edit');
          params = keep(['job_id', 'workspace', 'task_id', 'new', 'edit']);
        } else {
          route = map[file] || '/command';
          if (file === 'jobs.html') {
            if (params.get('tab') === 'tasks') {
              route = workspace('tasks');
              params = keep(['job_id', 'task_id', 'new', 'edit']);
            } else if (params.get('tab') === 'analytics') {
              route = workspace('analytics');
              params = keep(['job_id']);
            } else if (params.get('tab') === 'files') {
              route = workspace('files');
              params = keep(['job_id', 'folder']);
            } else if (params.get('tab') === 'forms') {
              route = workspace('forms');
              params = keep(['job_id']);
            } else {
              params = keep(['job_id', 'tab']);
            }
          } else if (file === 'files.html') {
            params = keep(['job_id', 'folder']);
          } else if (file === 'forms.html') {
            params = keep(['job_id']);
          } else {
            params = keep([]);
          }
        }
        var base = window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'));
        var target = new URL((base || '') + route, window.location.origin);
        target.search = params.toString();
        window.location.replace(target.toString());
      })();
    </script>
  </head>
  <body>
    <p>Opening Questbase...</p>
  </body>
</html>
`;
}
