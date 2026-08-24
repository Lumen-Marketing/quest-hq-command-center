(function installSupabaseSdkRecovery(root) {
  'use strict';

  const App = root.App = root.App || {};
  let pendingLoad = null;

  function isReady() {
    return !!(root.supabase && typeof root.supabase.createClient === 'function');
  }

  // The vendored SDK is the first deferred script in app.html. If that single
  // request is interrupted, every later Task screen used to stop at a permanent
  // "SDK failed to load" message. Retry the same release-tagged, same-origin
  // asset once before declaring auth unavailable.
  App.loadSupabaseSdk = function loadSupabaseSdk({ timeoutMs = 8000 } = {}) {
    if (isReady()) return Promise.resolve();
    if (pendingLoad) return pendingLoad;

    pendingLoad = new Promise((resolve, reject) => {
      const original = document.querySelector('script[src*="vendor/supabase/supabase.js"]');
      const source = original?.getAttribute('src') || `${App.basePath || '/taskmanagement/'}vendor/supabase/supabase.js`;
      const retryUrl = new URL(source, root.location.href);
      retryUrl.searchParams.set('retry', String(Date.now()));

      const script = document.createElement('script');
      script.src = retryUrl.toString();
      script.async = true;
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (!error && isReady()) resolve();
        else reject(error || new Error('Supabase SDK loaded without exposing createClient.'));
      };
      const timer = setTimeout(() => finish(new Error('Supabase SDK retry timed out.')), Math.max(1000, Number(timeoutMs) || 8000));
      script.onload = () => finish();
      script.onerror = () => finish(new Error('Supabase SDK retry failed.'));
      document.head.append(script);
    }).finally(() => {
      pendingLoad = null;
    });

    return pendingLoad;
  };
})(window);
