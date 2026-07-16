import assert from 'node:assert/strict';
import test from 'node:test';
import { parseContactInstruction, looksLikeContactInstruction } from '../src/assistant/contact-parser.js';

test('pulls name, email and phone out of one instruction', () => {
  const r = parseContactInstruction('add contact John Doe, 602-555-1234, john@quest.com');
  assert.equal(r.name, 'John Doe');
  assert.equal(r.email, 'john@quest.com');
  assert.equal(r.phone, '602-555-1234');
  assert.deepEqual(r.found, { email: true, phone: true });
});

test('handles spaced phone numbers and the "new contact" prefix', () => {
  const r = parseContactInstruction('new contact Maria Gonzalez 602 555 0100');
  assert.equal(r.name, 'Maria Gonzalez');
  assert.equal(r.phone, '602 555 0100');
  assert.equal(r.email, '');
});

test('name only is fine', () => {
  const r = parseContactInstruction('create contact Bob Henderson');
  assert.equal(r.name, 'Bob Henderson');
  assert.deepEqual(r.found, { email: false, phone: false });
});

test('falls back to the email local part when no name is given', () => {
  const r = parseContactInstruction('add contact sarah.lee@abc.com');
  assert.equal(r.email, 'sarah.lee@abc.com');
  assert.equal(r.name, 'sarah.lee');
});

test('a short number is not mistaken for a phone', () => {
  const r = parseContactInstruction('add contact Unit 12 Manager');
  assert.equal(r.phone, '');
  assert.match(r.name, /Unit 12 Manager/);
});

test('never returns an empty name', () => {
  assert.equal(parseContactInstruction('add contact').name, 'New contact');
  assert.equal(parseContactInstruction('   ').name, 'New contact');
});

test('looksLikeContactInstruction only fires on explicit contact intent', () => {
  assert.equal(looksLikeContactInstruction('add contact John Doe'), true);
  assert.equal(looksLikeContactInstruction('create a new contact'), true);
  assert.equal(looksLikeContactInstruction('remind me to call John'), false);
  assert.equal(looksLikeContactInstruction('jobs'), false);
});
