#!/usr/bin/env node
// Refuse to ship a production build from a tree that does not match a commit.
//
// A local `vercel --prod` uploads the WORKING TREE, not a commit. Production has been
// deployed that way with uncommitted changes in it, which leaves a build nobody can
// reproduce: the SHA the bundle reports describes the last commit, and the code that
// actually shipped is whatever happened to be on one laptop at one moment. Rolling back to
// that SHA gives you different software than the one serving traffic.
//
// This only guards the production path. Preview deploys and local builds are meant to be
// scrappy and are left alone.

import { execFileSync } from 'node:child_process';

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

let status;
try {
  status = git('status', '--porcelain');
} catch (error) {
  console.error('Not a git checkout, so there is nothing to verify. Refusing to deploy.');
  console.error(String(error.message || error).trim());
  process.exit(1);
}

// Untracked files are not part of the upload's behaviour -- vercel respects .gitignore and
// .vercelignore, and a stray report or scratch file is not a code change. Tracked
// modifications are: those DO ship, and they are what makes a deploy unreproducible.
const tracked = status.split('\n').filter((line) => line.trim() && !line.startsWith('??'));

if (tracked.length) {
  console.error('Refusing to build for production: tracked files differ from HEAD.\n');
  tracked.forEach((line) => console.error(`  ${line}`));
  console.error('\nCommit them (or stash them) first, so the deployed code has a name.');
  console.error('To deploy anyway -- and accept that the build cannot be reproduced --');
  console.error('run the vercel command directly rather than through npm run deploy:prod.');
  process.exit(1);
}

const sha = git('rev-parse', 'HEAD');
const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
console.log(`Clean tree: ${branch} at ${sha}`);
