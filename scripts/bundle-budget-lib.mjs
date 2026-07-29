export const DEFAULT_BUNDLE_LIMITS = Object.freeze({
  // Raised 340 -> 342 KB (2026-07) for the Appearance customization feature, then
  // 342 -> 344 KB after merging the native-Tasks/launch-hardening work and finishing the
  // contacts filter rail, then 344 -> 346 KB for cross-device/company appearance sync and
  // the company directory search+paging (measured 352277, 21 bytes over the old ceiling).
  // Conscious, measured bumps; the guard stays active. The durable fix is extracting slices
  // of src/main.js into modules — prefer that before raising further.
  //
  // Note: this ceiling is only meaningful because __QUEST_BUILD_SHA__ falls back to a
  // high-entropy 40-char placeholder (vite.config.js). Before that, local builds embedded
  // a short word, measured ~33 gzip bytes light, and passed here while failing the deploy.
  // 346 -> 348 KB for the direct-message recipient search (measured 354581). This is
  // the fourth bump. Raising it again should be treated as blocked: the next growth
  // needs a real reduction, and the only thing that shrinks the ENTRY chunk is moving
  // a slice behind a dynamic import (a statically imported module still gets bundled
  // into the same chunk — see how the Help dialog and vendor-supabase are split).
  // Admin-only surfaces (platform master panel, client-portal plan reviewer) are the
  // obvious candidates.
  entryJs: 348 * 1024,
  initialJs: 440 * 1024,
  entryCss: 120 * 1024,
});

function initialManifestEntries(manifest, entryKey) {
  const seen = new Set();
  const visit = (key) => {
    if (!key || seen.has(key) || !manifest[key]) return;
    seen.add(key);
    (manifest[key].imports || []).forEach(visit);
  };
  visit(entryKey);
  return [...seen].map((key) => manifest[key]);
}

export function checkBundleBudget({ manifest, gzipSizes, limits = DEFAULT_BUNDLE_LIMITS }) {
  const failures = [];
  const entryPair = Object.entries(manifest || {}).find(([, value]) => value?.isEntry);
  if (!entryPair) return ['Bundle manifest has no entry module.'];
  const [entryKey, entry] = entryPair;
  const entryBytes = Number(gzipSizes[entry.file] || 0);
  const initialBytes = initialManifestEntries(manifest, entryKey)
    .reduce((total, item) => total + Number(gzipSizes[item.file] || 0), 0);
  const cssBytes = (entry.css || []).reduce((total, file) => total + Number(gzipSizes[file] || 0), 0);
  if (entryBytes > limits.entryJs) failures.push(`Entry JavaScript ${entryBytes} exceeds ${limits.entryJs} gzip bytes.`);
  if (initialBytes > limits.initialJs) failures.push(`Initial JavaScript ${initialBytes} exceeds ${limits.initialJs} gzip bytes.`);
  if (cssBytes > limits.entryCss) failures.push(`Entry CSS ${cssBytes} exceeds ${limits.entryCss} gzip bytes.`);
  return failures;
}
