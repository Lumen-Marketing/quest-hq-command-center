// What the router actually fetches for a public intake link: the page, with its stylesheet.
//
// The stylesheet is imported HERE rather than at the top of public-page.js so that the page's
// logic stays importable from node, where the tests run and a .css import cannot resolve. Vite
// preloads a chunk's CSS before the chunk resolves, so the form never paints unstyled.
//
// It is its own sheet, not part of src/styles.css, because only somebody opening a link needs
// it, and the entry stylesheet sits within about 2 KB of its gzip budget.

import './public-page.css';

export * from './public-page.js';
