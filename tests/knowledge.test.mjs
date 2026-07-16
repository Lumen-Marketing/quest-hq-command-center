import assert from 'node:assert/strict';
import test from 'node:test';
import { filterKnowledgeArticles, knowledgeCategories } from '../src/data/knowledge.js';

const ARTICLES = [
  { id: 'a1', title: 'Roof inspection SOP', category: 'Field', body: 'Check flashing and vents.' },
  { id: 'a2', title: 'Warranty claim process', category: 'Office', body: 'File within 30 days.' },
  { id: 'a3', title: 'Ladder safety checklist', category: 'Field', body: 'Inspect rungs before every climb.' },
];

test('filters by every query word across title, category and body', () => {
  assert.deepEqual(filterKnowledgeArticles(ARTICLES, 'roof').map((a) => a.id), ['a1']);
  assert.deepEqual(filterKnowledgeArticles(ARTICLES, 'field').map((a) => a.id), ['a1', 'a3']); // category
  assert.deepEqual(filterKnowledgeArticles(ARTICLES, 'flashing').map((a) => a.id), ['a1']);     // body
  assert.deepEqual(filterKnowledgeArticles(ARTICLES, 'safety ladder').map((a) => a.id), ['a3']); // all words
});

test('empty query returns all; nonsense returns none', () => {
  assert.equal(filterKnowledgeArticles(ARTICLES, '').length, 3);
  assert.equal(filterKnowledgeArticles(ARTICLES, '   ').length, 3);
  assert.equal(filterKnowledgeArticles(ARTICLES, 'zzz').length, 0);
});

test('knowledgeCategories rolls up distinct categories with counts, sorted', () => {
  assert.deepEqual(knowledgeCategories(ARTICLES), [
    { name: 'Field', count: 2 },
    { name: 'Office', count: 1 },
  ]);
});

test('a missing category falls back to General', () => {
  const cats = knowledgeCategories([{ title: 'x', body: 'y' }]);
  assert.deepEqual(cats, [{ name: 'General', count: 1 }]);
});
