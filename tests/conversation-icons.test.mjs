import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/202607300900_message_conversation_icons.sql', import.meta.url), 'utf8');

test('a direct chat is identified by the other participant, not the last sender', () => {
  // The row used the newest message's sender, which for a chat you sent is you — so
  // your own face appeared next to the person you were talking to.
  assert.match(source, /function conversationCounterpartProfileId\(conversation\)/);
  assert.match(source, /\.find\(\(profileId\) => profileId !== me\)/);
  const row = source.match(/function renderConversationRow\([\s\S]*?\n\}/)[0];
  assert.match(row, /renderConversationIcon\(conversation, 'conversation-avatar'\)/);
  assert.doesNotMatch(row, /renderAvatar\(sender \|\| \{ full_name: conversation\.title \}/,
    'the row must no longer key its avatar off the last sender');
});

test('groups prefer their own icon, direct chats never do', () => {
  const fn = source.match(/function renderConversationIcon\([\s\S]*?\n\}/)[0];
  assert.match(fn, /conversation\.type !== 'direct' && \(conversation\.icon_image \|\| conversation\.icon_key\)/);
  // Falls back to initials via renderAvatar when there is no icon and no counterpart.
  assert.match(fn, /renderAvatar\(sender \|\| \{ full_name: conversation\.title \}/);
});

test('conversation icons are normalized and persisted', () => {
  const norm = source.match(/function normalizeMessageConversation\([\s\S]*?\n\}/)[0];
  // Reuses the workspace icon allowlist and the same data-URL sanitizer.
  assert.match(norm, /WORKSPACE_ICON_OPTIONS\.some\(\(item\) => item\.key === String\(input\.icon_key\)\.trim\(\)\)/);
  assert.match(norm, /icon_image: sanitizeWorkspaceIconImage\(input\.icon_image\)/);
  const payload = source.match(/function messageConversationPayload\([\s\S]*?\n\}/)[0];
  assert.match(payload, /icon_key: conversation\.icon_key \|\| ''/);
  assert.match(payload, /icon_image: conversation\.icon_image \|\| ''/);
});

test('picking a glyph and uploading an image are mutually exclusive', () => {
  // Otherwise both could read as "active" and the stored row would be ambiguous.
  assert.match(source, /state\.messageGroupIcon = \{ icon_key: node\.dataset\.iconKey \|\| '', icon_image: '' \};/);
  assert.match(source, /state\.messageGroupIcon = \{ icon_key: messageGroupIconDraft\(\)\.icon_key, icon_image: output \};/);
});

test('the group icon draft resets when the modal opens', () => {
  // A leftover draft would silently brand the next group someone created.
  assert.match(source, /state\.messageGroupIcon = \{ icon_key: '', icon_image: '' \};\s*\n\s*state\.modal = 'message-group-new';/);
});

test('uploads go through the shared compress-to-192px pipeline', () => {
  assert.match(source, /async function prepareMessageGroupIconUpload\(file\)/);
  assert.match(source, /const output = await workspaceIconFileToDataUrl\(file\);/);
});

test('the migration is additive and constrains what an icon may be', () => {
  assert.match(migration, /add column if not exists icon_key text not null default ''/);
  assert.match(migration, /add column if not exists icon_image text not null default ''/);
  assert.match(migration, /check \(pg_column_size\(icon_image\) <= 512 \* 1024\)/);
  // Data URLs only: a remote reference would let a chat icon beacon to another host.
  assert.match(migration, /icon_image ~ '\^data:image\/\(png\|jpeg\|webp\);base64,\[A-Za-z0-9\+\/=\]\+\$'/);
});
