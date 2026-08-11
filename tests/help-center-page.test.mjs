import assert from 'node:assert/strict';
import test from 'node:test';

import { createHelpCenterPage } from '../src/help/help-center-page.js';

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function companyPath(section, params = {}, companyId = 'acme') {
  const search = new URLSearchParams({ ...params, workspace: 'ws-1' });
  return `/company/${companyId}/${section}?${search.toString()}`;
}

function route(params = {}) {
  return { params: new URLSearchParams(params) };
}

function pageWithAccess(canOpenModule = () => true) {
  return createHelpCenterPage({
    h: esc,
    appHref: (value) => value,
    companyPath,
    canOpenModule,
    supportEmail: 'support@example.test',
  });
}

test('browse page exposes accessible search, categories, quick starts, and result count', () => {
  const html = pageWithAccess().renderHelpCenterPage(route(), 'acme');

  assert.match(html, /<section class="help-center-page"/);
  assert.match(html, /<form class="help-search" role="search" data-help-search-form/);
  assert.match(html, /aria-label="Search Questbase help"/);
  assert.match(html, /role="status"[^>]*>\d+ (?:guides|guide)<\/span>/);
  assert.match(html, /Getting started/);
  assert.match(html, /Quick starts/);
  assert.match(html, /Navigate Questbase/);
  assert.match(html, /Set up or reconfigure a workspace/);
});

test('browse page hides denied module guidance but keeps general help', () => {
  const html = pageWithAccess(() => false).renderHelpCenterPage(route(), 'acme');

  assert.match(html, /Navigate Questbase/);
  assert.match(html, /Use the command palette/);
  assert.doesNotMatch(html, /Add or find a contact/);
  assert.doesNotMatch(html, /Set up or reconfigure a workspace/);
});

test('selected tutorial renders ordered steps and a workspace-preserving module action', () => {
  const html = pageWithAccess().renderHelpCenterPage(route({ topic: 'task-setup-back' }), 'acme');

  assert.match(html, /<article class="help-article"/);
  assert.match(html, /<h1[^>]*data-help-topic-heading[^>]*>Return from Task setup to Tasks<\/h1>/);
  assert.match(html, /<ol class="help-steps">/);
  assert.match(html, /Finish or cancel the task-type/);
  assert.match(html, /href="\/company\/acme\/tasks\?workspace=ws-1"[^>]*data-router[^>]*>[^]*Open Tasks/);
  assert.match(html, /Back to all help/);
});

test('unknown or inaccessible topic renders a safe unavailable notice', () => {
  const unknown = pageWithAccess().renderHelpCenterPage(route({ topic: 'missing-topic' }), 'acme');
  assert.match(unknown, /That help article is no longer available/);
  assert.match(unknown, /Browse all help/);

  const denied = pageWithAccess(() => false).renderHelpCenterPage(route({ topic: 'contacts' }), 'acme');
  assert.match(denied, /That help article is no longer available/);
  assert.doesNotMatch(denied, /Contacts live under/);
});

test('zero-result state and support panel reuse the existing support action', () => {
  const html = pageWithAccess().renderHelpCenterPage(route({ q: 'zzzqqq' }), 'acme');

  assert.match(html, /No guide matched/);
  assert.match(html, /Clear search/);
  assert.match(html, /Still need help/);
  assert.match(html, /data-action="open-support"/);
  assert.match(html, /mailto:support%40example.test/);
});

