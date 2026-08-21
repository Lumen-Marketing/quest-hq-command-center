import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import publicFormOpen from '../api/public-form-open.js';
import { resetRateLimits } from '../api/_lib/rate-limit.js';
import { writePdf } from '../src/form/doc-pdf.js';
import { createCallsPage } from '../src/ops/calls-page.js';
import { createEstimateBuilder } from '../src/ops/estimate-builder.js';
import { createProposalBuilderModal } from '../src/proposals/proposal-builder-modal.js';

const originalEnv = { ...process.env };

test.beforeEach(() => {
  resetRateLimits();
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc';
});

test.afterEach(() => { process.env = { ...originalEnv }; });

function response() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(name, value) { this.headers[name] = value; },
    end(chunk) { this.body = chunk || ''; },
    json() { return JSON.parse(this.body || '{}'); },
  };
}

function modalShell(product, title, body) {
  return { product, title, body };
}

test('proposal and estimate dialogs identify the current Questbase product', () => {
  const shared = {
    currentProposalContext: () => null,
    currentEstimateContext: () => null,
    emptyState: (message) => message,
    renderModalShell: modalShell,
  };

  const proposal = createProposalBuilderModal(shared).renderProposalBuilderModal('company-1');
  const estimate = createEstimateBuilder(shared).renderEstimateBuilderModal('company-1');

  assert.equal(proposal.product, 'Questbase');
  assert.equal(estimate.product, 'Questbase');
});

test('the calls empty state names the Questbase login', () => {
  const page = createCallsPage({
    CALLS_RANGE_OPTIONS: [['today', 'Today']],
    appHref: (value) => value,
    callsBoardMarkup: () => '',
    callsNotConnectedMarkup: () => '',
    callsRangeKey: () => 'today',
    companyPath: () => '/calls',
    emptyState: (message) => message,
    ensureCallsData: () => {},
    h: (value) => String(value),
    state: {
      callsPresence: { forbidden: true },
      callsStats: { key: 'company-1|today', rows: [], sync: null, unavailable: false },
    },
    timeAgo: (value) => String(value),
  }).renderCallsPage({}, 'company-1');

  assert.match(page, /Questbase login/);
  assert.doesNotMatch(page, /Command Center login/);
});

test('public forms keep Questbase branding when company decoration is unavailable', async () => {
  const db = async (path) => {
    if (path.startsWith('/rest/v1/forms?')) {
      return {
        ok: true,
        async json() {
          return [{
            id: 'form-1', company_id: 'company-1', title: 'Request service', status: 'Published',
            questions: [],
          }];
        },
      };
    }
    if (path.startsWith('/rest/v1/companies?')) return { ok: false, async json() { return []; } };
    throw new Error(`Unexpected database request: ${path}`);
  };
  const res = response();

  await publicFormOpen({
    method: 'GET',
    url: '/api/public-form-open?form_id=form-1',
    headers: { host: 'app.example.com' },
  }, res, { db });

  assert.equal(res.statusCode, 200);
  assert.equal(res.json().company.name, 'Questbase');
});

test('generated documents and the install manifest expose Questbase branding', () => {
  const pdf = Buffer.from(writePdf({ page: { size: 'a4' }, title: 'Sample' })).toString('latin1');
  const manifest = JSON.parse(readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'));

  assert.match(pdf, /\/Producer \(Questbase\)/);
  assert.equal(manifest.name, 'Questbase');
  assert.equal(manifest.short_name, 'Questbase');
});
