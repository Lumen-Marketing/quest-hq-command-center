import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { WORKSPACE_PLUGIN_REGISTRY } from '../src/workspaces/plugin-catalog.js';

// The Appearance panel markup now lives in its own lazily-fetched module. These read
// both files as one source: the assertions are about what the app renders, not about
// which file happens to hold it.
// Concatenated, because these behaviours are wired across main.js and the modules it
// fetches on demand -- the map-pin dialog's markup moved out to pay the bundle budget, and
// asserting against main.js alone would report it as deleted.
const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/ui/appearance-panel.js', import.meta.url), 'utf8')
  + readFileSync(new URL('../src/crm/location-picker-modal.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const vercelJson = readFileSync(new URL('../vercel.json', import.meta.url), 'utf8');
const vercelConfig = JSON.parse(vercelJson);
const migrations = readdirSync(new URL('../supabase/migrations/', import.meta.url));

test('supabase client is pinned and api routes are not swallowed by the SPA rewrite', () => {
  assert.match(source, /import \{ createClient as createSupabaseJsClient \} from '@supabase\/supabase-js';/);
  assert.match(source, /supabaseClientCache = createSupabaseJsClient\(CONFIG\.supabaseUrl, CONFIG\.supabaseKey\);/);
  assert.match(packageJson, /"@supabase\/supabase-js":/);
  assert.doesNotMatch(indexHtml, /cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js/);
  const fallback = vercelConfig.rewrites.find((rule) => rule.destination === '/index.html');
  assert.ok(fallback, 'expected the company-route SPA fallback');
  const matcher = new RegExp(`^${fallback.source}$`);
  assert.equal(matcher.test('/api/address-suggestions'), false, 'API routes must stay outside the SPA');
  assert.equal(matcher.test('/assets/retired-build.js'), false, 'static assets must stay outside the SPA');
  assert.equal(matcher.test('/company/lumen/jobs'), true, 'company routes must still open the SPA');
  assert.ok(existsSync(new URL('../api/address-suggestions.js', import.meta.url)));
});

test('price book is a real installed workspace module without removing proposals', () => {
  const priceBookPlugin = WORKSPACE_PLUGIN_REGISTRY.find(({ id }) => id === 'price_book');
  const crmPlugin = WORKSPACE_PLUGIN_REGISTRY.find(({ id }) => id === 'crm_2');
  assert.match(source, /\['price_book\.view', 'View price book'\]/);
  assert.match(source, /\['price_book\.manage', 'Manage price book/);
  assert.ok(priceBookPlugin, 'Expected the price book plugin in the workspace catalog');
  assert.deepEqual(priceBookPlugin.module_ids, ['price-book']);
  assert.match(source, /\{ id: 'price-book', group: 'Estimating', label: 'Price Book'/);
  assert.match(source, /if \(route\.section === 'price-book'\) return renderPriceBookPage\(route, companyId\);/);
  assert.match(source, /function renderPriceBookPage\(route, companyId\)/);
  assert.match(source, /function savePricebookVendor\(form\)/);
  assert.match(source, /function savePricebookMaterial\(form\)/);
  assert.match(source, /function importPricebookRows\(form\)/);
  assert.match(source, /client\.from\('pricebook_vendors'\)\.select\('\*'\)/);
  assert.match(source, /client\.from\('pricebook_materials'\)\.select\('\*'\)/);
  assert.match(source, /client\.from\('pricebook_vendor_prices'\)\.select\('\*'\)/);
  assert.equal(crmPlugin?.label, 'Quest CRM');
  assert.deepEqual(crmPlugin?.module_ids, ['workday', 'contacts', 'deals', 'proposals', 'jobs']);
  assert.match(source, /\{ id: 'proposals', group: 'Quest CRM', label: 'Proposals'/);
  assert.match(source, /\{ label: 'Pipeline', ids: \['contacts'\] \}/);
  assert.match(source, /\{ label: 'Production', ids: \['jobs'\] \}/);
  assert.match(source, /\{ label: 'Tools', ids: \['underwriter', 'proposals'\] \}/);
  assert.match(styles, /\.price-book-page/);
  assert.match(styles, /\.pb-table-wrap/);
});

test('quote records support reusable line items and total from price book or manual costs', () => {
  assert.match(source, /const DEAL_COLS = \[[^\]]*'line_items'/);
  assert.match(source, /function normalizeDealLineItems\(raw\)/);
  assert.match(source, /function dealLineSell\(item\)/);
  assert.match(source, /function dealLineItemsTotal\(deal\)/);
  assert.match(source, /function renderDealLineItems\(deal, companyId\)/);
  assert.match(source, /data-quote-line-item-form/);
  assert.match(source, /data-action="remove-quote-line-item"/);
  assert.match(source, /async function addQuoteLineItem\(form\)/);
  assert.match(source, /async function removeQuoteLineItem\(dealId, lineId\)/);
  assert.match(source, /value: dealLineItemsTotal\(\{ line_items \}\)/);
});

test('dark theme, drag-drop pipeline, activity detail modal, and map picker are wired', () => {
  assert.match(source, /const THEME_KEY = 'quest-theme';/);
  assert.match(source, /function applyTheme\(theme = getTheme\(\), accent = getAccent\(\)\)/);
  assert.match(source, /data-action="set-theme"/);
  assert.match(styles, /\[data-theme="dark"\]/);
  assert.match(source, /let pipeDrag = null;/);
  assert.match(source, /function onPipeDragStart\(event\)/);
  assert.match(source, /function onPipeDrop\(event\)/);
  assert.match(source, /document\.addEventListener\('dragstart', onPipeDragStart\)/);
  assert.match(source, /draggable="true" data-drag-kind=/);
  assert.match(source, /function renderActivityDetailModal\(\)/);
  assert.match(source, /data-action="open-activity"/);
  assert.match(source, /state\.modal = 'activity-detail'/);
  assert.match(source, /function renderLocationPickerModal\(\)/);
  assert.match(source, /data-action="open-location-picker"/);
  assert.match(source, /data-action="location-picker-search"/);
  assert.match(source, /data-action="location-picker-current"/);
  assert.match(source, /function searchLocationPickerAddress\(\)/);
  assert.match(source, /function useCurrentLocationForPicker\(\)/);
  assert.match(source, /navigator\.geolocation\.getCurrentPosition/);
  assert.match(source, /function reverseGeocodeLocationPicker\(lat, lng\)/);
  assert.match(source, /Manual pin/);
  assert.match(source, /data-location-picker-form/);
  assert.match(source, /function mountLocationPicker\(\)/);
  assert.match(source, /leaflet/);
  assert.match(source, /await refreshAddressSuggestions\(input\)/);
});

test('source-tracked migrations mirror production-applied price book and line item schema', () => {
  assert.ok(migrations.includes('20260701164822_price_book_module.sql'));
  assert.ok(migrations.includes('20260701170157_price_book_plugin_allowlist.sql'));
  assert.ok(migrations.includes('20260701172001_price_book_vendor_credit_terms.sql'));
  assert.ok(migrations.includes('20260701172824_price_book_vendor_credit_line.sql'));
  assert.ok(migrations.includes('20260702010731_deals_line_items.sql'));
});

test('price book plugin and RLS use the live company plugin system safely', () => {
  const priceBookSql = readFileSync(new URL('../supabase/migrations/20260701164822_price_book_module.sql', import.meta.url), 'utf8');
  const allowlistSql = readFileSync(new URL('../supabase/migrations/20260701170157_price_book_plugin_allowlist.sql', import.meta.url), 'utf8');
  assert.doesNotMatch(allowlistSql, /workspace_plugins/);
  assert.doesNotMatch(allowlistSql, /workspace_plugin_modules/);
  assert.match(allowlistSql, /alter table public\.company_plugins[\s\S]*company_plugins_known_plugin_check[\s\S]*'price_book'/);
  assert.match(allowlistSql, /create or replace function public\.set_company_plugin/);
  assert.match(allowlistSql, /'price_book'/);
  assert.match(allowlistSql, /when permission like 'price_book\.%' then array\['price_book'\]/);
  assert.match(priceBookSql, /for select to authenticated[\s\S]*app_private\.has_company_permission\(company_id, 'price_book\.view'\)/);
  assert.match(priceBookSql, /for insert to authenticated[\s\S]*app_private\.has_company_permission\(company_id, 'price_book\.manage'\)/);
  assert.match(priceBookSql, /for update to authenticated[\s\S]*app_private\.has_company_permission\(company_id, 'price_book\.manage'\)/);
  assert.match(priceBookSql, /for delete to authenticated[\s\S]*app_private\.has_company_permission\(company_id, 'price_book\.manage'\)/);
});
