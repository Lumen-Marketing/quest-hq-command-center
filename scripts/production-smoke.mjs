import {
  DEFAULT_PRODUCTION_URL,
  buildProductionRoutes,
  checkWithRetry,
  extractAssetUrls,
  parseSmokeArgs,
  validateAppShell,
  validateLegacyRedirect,
} from './production-smoke-lib.mjs';

const cli = parseSmokeArgs(process.argv.slice(2));
const baseUrl = cli.baseUrl || process.env.QUEST_HQ_PROD_URL || DEFAULT_PRODUCTION_URL;
const expectedSha = String(cli.expectedSha || process.env.QUEST_HQ_EXPECTED_SHA || '').trim();
const companies = String(cli.companies || process.env.QUEST_HQ_COMPANIES || 'lumen').split(',').map((company) => company.trim()).filter(Boolean);
const routes = buildProductionRoutes(companies);
const rootResult = await checkWithRetry(new URL('/', baseUrl).toString());

if (!rootResult.ok) {
  console.error(`FAIL ${rootResult.status || rootResult.error || 'unknown'} application shell`);
  process.exitCode = 1;
} else {
  const shell = validateAppShell(rootResult.body);
  if (!shell.ok) {
    console.error(`FAIL ${rootResult.status} application shell: ${shell.reason}`);
    process.exitCode = 1;
  }
}

const assetUrls = rootResult.ok ? extractAssetUrls(rootResult.body, rootResult.url || baseUrl) : [];
const assetResults = await Promise.all(assetUrls.map(async (url) => ({ url, ...(await checkWithRetry(url, 1)) })));
for (const result of assetResults) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.status || result.error || 'unknown'} ${new URL(result.url).pathname}`);
  if (!result.ok) process.exitCode = 1;
}

if (expectedSha) {
  const jsBodies = assetResults.filter((result) => result.ok && new URL(result.url).pathname.endsWith('.js')).map((result) => result.body);
  if (!jsBodies.some((body) => body.includes(expectedSha))) {
    console.error(`FAIL deployed assets do not contain expected commit ${expectedSha}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS deployed commit ${expectedSha}`);
  }
}

const expectedEntryAssets = assetUrls.map((url) => new URL(url).pathname);
const results = [];
for (const route of routes) {
  const url = new URL(route, baseUrl).toString();
  const result = await checkWithRetry(url, 2);
  let ok = result.ok && result.contentType.includes('text/html');
  let error = result.error;
  let isLegacyRedirect = false;
  if (ok) {
    const shell = validateAppShell(result.body);
    ok = shell.ok;
    error = shell.reason;
    if (!ok && route.endsWith('.html')) {
      const legacyRedirect = validateLegacyRedirect(result.body);
      ok = legacyRedirect.ok;
      error = legacyRedirect.reason;
      isLegacyRedirect = legacyRedirect.ok;
    }
  }
  if (ok && !isLegacyRedirect) {
    const routeAssets = extractAssetUrls(result.body, result.url || url).map((asset) => new URL(asset).pathname);
    ok = expectedEntryAssets.every((asset) => routeAssets.includes(asset));
    if (!ok) error = 'route returned a different application build';
  }
  results.push({ route, ...result, ok, error });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${result.status || error || 'unknown'} ${route}${ok ? '' : ` (${error || 'invalid response'})`}`);
}

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} production routes passed with ${assetResults.filter((result) => result.ok).length}/${assetResults.length} entry assets available.`);
if (failed.length) process.exitCode = 1;
