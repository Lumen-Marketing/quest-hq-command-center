import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const taskMobileStyles = readFileSync(new URL('../taskmanagement/css/mobile.css', import.meta.url), 'utf8');

test('mobile message threads cannot grow an implicit grid track past the card', () => {
  assert.match(styles, /\/\* Mobile launch hardening \*\//);
  assert.match(
    styles,
    /@media \(max-width: 820px\)[\s\S]*?\.message-simple-main\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/,
  );
  assert.match(
    styles,
    /\.message-simple-main\s*>\s*\.thread-head,[\s\S]*?\.message-simple-main\s*>\s*\.message-composer\s*\{[^}]*min-width:\s*0;[^}]*width:\s*100%;[^}]*max-width:\s*100%;/,
  );
});

test('mobile calls widgets and job forms remain inside the phone viewport', () => {
  assert.match(
    styles,
    /@media \(max-width: 720px\)[\s\S]*?\.calls-widget\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/,
  );
  assert.match(
    styles,
    /\.calls-widget\s*>\s*\*\s*\{[^}]*min-width:\s*0;[^}]*width:\s*100%;[^}]*max-width:\s*100%;/,
  );
  assert.match(
    styles,
    /@media \(max-width: 720px\)[\s\S]*?\.modal-panel\s*\{[^}]*max-height:\s*calc\(100dvh - 16px\);/,
  );
});

test('host phone actions expose comfortable touch targets', () => {
  assert.match(
    styles,
    /@media \(max-width: 720px\)[\s\S]*?\.message-simple-sidebar \.message-filter button,[\s\S]*?\.calls-widget-range\s*\{[^}]*min-height:\s*40px;/,
  );
  assert.match(
    styles,
    /@media \(max-width: 720px\)[\s\S]*?\.account-accent-swatch\s*\{[^}]*width:\s*40px;[^}]*height:\s*40px;/,
  );
  assert.match(
    styles,
    /@media \(max-width: 720px\)[\s\S]*?\.modal-panel \.form-actions \.btn\s*\{[^}]*min-height:\s*44px;/,
  );
});

test('embedded Tasks grows primary controls on ordinary phone widths', () => {
  assert.match(taskMobileStyles, /@media \(min-width: 340px\) and \(max-width: 720px\)/);
  assert.match(taskMobileStyles, /--m-ctl:\s*40px;/);
  assert.match(
    taskMobileStyles,
    /#scopeSeg button\s*\{[^}]*width:\s*40px;[^}]*height:\s*40px;/,
  );
  assert.match(
    taskMobileStyles,
    /\.controls-card \.btn\s*\{[^}]*width:\s*40px;[^}]*height:\s*40px;/,
  );
});
