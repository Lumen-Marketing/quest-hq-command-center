window.App = window.App || {};
App.authEnabled = false;

// Routes are derived from the URL and need no secrets, so they can be set
// synchronously. Other modules read App.routes during script-load.
const pathName = window.location.pathname;
const lowerPath = pathName.toLowerCase();
const taskmanagementMount = lowerPath.match(/^(.*\/taskmanagement\/)/);
App.basePath = taskmanagementMount
  ? taskmanagementMount[1]
  : (lowerPath.startsWith('/taskmanagementquest/') ? '/TaskManagementQuest/' : '/');

const commandCenterBasePath = taskmanagementMount
  ? App.basePath.replace(/taskmanagement\/$/i, '')
  : App.basePath;

const routeParams = new URLSearchParams(window.location.search);
const defaultReturnUrl = `${window.location.origin}${commandCenterBasePath}jobs.html`;

function sameOriginUrl(value, fallback) {
  try {
    const candidate = new URL(value || fallback, window.location.href);
    return candidate.origin === window.location.origin ? candidate.toString() : fallback;
  } catch (error) {
    return fallback;
  }
}

App.commandCenterIntegration = {
  hosted: !!taskmanagementMount,
  basePath: commandCenterBasePath,
  projectId: (routeParams.get('project_id') || '').trim(),
  returnUrl: sameOriginUrl((routeParams.get('return_url') || '').trim(), defaultReturnUrl),
};

App.routes = {
  // In Command Center mode, login/approval/profile ownership lives in the host app.
  login: App.commandCenterIntegration.hosted
    ? `${window.location.origin}${commandCenterBasePath}login.html?return_url=${encodeURIComponent(window.location.href)}`
    : `${window.location.origin}${App.basePath}`,
  app: `${window.location.origin}${App.basePath}app.html`,
};

App.commandCenterProfileUrl = App.commandCenterIntegration.hosted
  ? `${window.location.origin}${commandCenterBasePath}index.html?account=profile`
  : '';

App.defaultSupabaseConfig = {
  supabaseUrl: 'https://lpzotcznihwyyudxycmd.supabase.co',
  supabaseAnonKey: 'sb_publishable_Gd1aHMtItu-7daoq2YofeA_9wl1pQ07',
};

// Runtime config: fetch env.json (per-environment, never committed) and
// construct the Supabase client from it. Anything that needs `App.supabase`
// must `await App.configReady` first. On failure we set App.supabaseLoadError
// so dependents (AuthModel, auth-guard) can render a clean error rather than
// throw an unhandled exception. We never reject the promise — defensive
// programming: callers always get a definite signal via App.supabase presence.
App.configReady = (async function loadRuntimeConfig() {
  if (App.authEnabled === false) {
    App.supabase = null;
    App.supabaseLoadError = '';
    return;
  }

  const envUrl = `${App.basePath}env.json`;
  try {
    const res = await fetch(envUrl, { cache: 'no-store', credentials: 'same-origin' });
    const env = res.ok ? await res.json() : App.defaultSupabaseConfig;
    const url = typeof env.supabaseUrl === 'string' ? env.supabaseUrl.trim() : '';
    const key = typeof env.supabaseAnonKey === 'string' ? env.supabaseAnonKey.trim() : '';

    if (!url || !key) {
      throw new Error('env.json is missing supabaseUrl or supabaseAnonKey.');
    }
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)\/?$/i.test(url)) {
      throw new Error('env.json supabaseUrl does not look like a Supabase project URL.');
    }
    // Refuse anything that looks like a server-side key. The browser only ever
    // gets the publishable / anon-tier key; service_role keys are RLS-bypassing
    // admin credentials and must never be shipped.
    if (/^sb_secret_|service_role/i.test(key) || key.length > 400) {
      throw new Error('env.json supabaseAnonKey is not a publishable / anon key.');
    }
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('Supabase JS SDK failed to load.');
    }

    // Optional observability config — surfaced for js/observability.js. Both
    // are safe to expose to the browser (Sentry DSN is write-only; release is
    // a commit SHA).
    App.sentryDsn = typeof env.sentryDsn === 'string' ? env.sentryDsn.trim() : '';
    App.release = typeof env.release === 'string' ? env.release.trim() : '';

    // Cloudflare Turnstile site key. When present, the login page renders an
    // invisible widget and forwards the token to Supabase Auth as
    // options.captchaToken. The site key is public by design (paired with a
    // secret held server-side by Supabase). If empty, captcha is off.
    App.turnstileSiteKey = typeof env.turnstileSiteKey === 'string' ? env.turnstileSiteKey.trim() : '';

    // Wrap fetch with a request-level timeout so a half-dead network can't
    // hang a save forever. AbortController.abort() surfaces as an AbortError,
    // which App.errors.fromSupabase translates to TimeoutError downstream.
    const REQUEST_TIMEOUT_MS = 15000;
    const timedFetch = (input, init = {}) => {
      const controller = new AbortController();
      if (init.signal) {
        if (init.signal.aborted) controller.abort(init.signal.reason);
        else init.signal.addEventListener('abort', () => controller.abort(init.signal.reason), { once: true });
      }
      const timer = setTimeout(() => {
        try { controller.abort(new DOMException('Request timed out', 'TimeoutError')); }
        catch { controller.abort(); }
      }, REQUEST_TIMEOUT_MS);
      return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
    };

    App.supabase = window.supabase.createClient(url, key, {
      global: { fetch: timedFetch },
    });

    // Expose the public connection params so a flow that needs a short-lived,
    // ISOLATED client can build one — e.g. verifying the current password on a
    // throwaway client so it never disturbs the live session. The anon key is
    // publishable by design (the same one already shipped to the browser).
    App.supabaseUrl = url;
    App.supabaseAnonKey = key;
  } catch (err) {
    const message = (err && err.message) ? err.message : String(err);
    App.supabaseLoadError = `Configuration unavailable: ${message}`;
    // eslint-disable-next-line no-console
    console.error('[config]', App.supabaseLoadError);
  }
})();
