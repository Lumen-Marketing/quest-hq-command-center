export const DEFAULT_BUNDLE_LIMITS = Object.freeze({
  // Raised 340 -> 342 KB (2026-07) for the Appearance customization feature (theme
  // background patterns/upload + card glass/solid styling). Conscious, measured bump;
  // the guard stays active. Prefer trimming/extracting before raising this further.
  entryJs: 342 * 1024,
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
