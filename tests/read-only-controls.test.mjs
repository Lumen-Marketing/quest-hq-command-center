import assert from 'node:assert/strict';
import test from 'node:test';

import { applyReadOnlyControlState } from '../src/ui/read-only-controls.js';

function fakeNode({ action = '', tagName = 'BUTTON', disabled = false } = {}) {
  const attributes = new Map();
  const classes = new Set();
  return {
    dataset: action ? { action } : {},
    tagName,
    disabled,
    attributes,
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      contains: (name) => classes.has(name),
    },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute(name) { return attributes.get(name); },
    matches(selector) {
      if (selector === 'button, input, select, textarea, option, fieldset') {
        return ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'OPTION', 'FIELDSET'].includes(tagName);
      }
      return false;
    },
    closest() { return null; },
  };
}

function rootWith({ actions = [], forms = [], files = [], externalSubmits = [], formById = () => null } = {}) {
  return {
    ownerDocument: { getElementById: formById },
    querySelectorAll(selector) {
      if (selector === '[data-action]') return actions;
      if (selector === 'form') return forms;
      if (selector === 'input[type="file"]') return files;
      if (selector === '[type="submit"][form]') return externalSubmits;
      return [];
    },
  };
}

test('read-only mode visibly disables mutable actions but keeps navigation usable', () => {
  const addJob = fakeNode({ action: 'new-job' });
  const invite = fakeNode({ action: 'send-invite-email' });
  const close = fakeNode({ action: 'close-modal' });
  const openContact = fakeNode({ action: 'open-contact', tagName: 'A' });
  const root = rootWith({ actions: [addJob, invite, close, openContact] });

  applyReadOnlyControlState(root, {
    readOnly: true,
    isMutableAction: (action) => ['new-job', 'send-invite-email'].includes(action),
    isMutableFormSubmit: () => false,
  });

  for (const control of [addJob, invite]) {
    assert.equal(control.disabled, true);
    assert.equal(control.getAttribute('aria-disabled'), 'true');
    assert.equal(control.getAttribute('data-readonly-disabled'), 'true');
  }
  assert.equal(close.disabled, false);
  assert.equal(openContact.getAttribute('data-readonly-disabled'), undefined);
});

test('read-only mode disables mutable form fields and standalone upload inputs', () => {
  const field = fakeNode({ tagName: 'INPUT' });
  const submit = fakeNode({ tagName: 'BUTTON' });
  const safeClose = fakeNode({ action: 'close-modal' });
  const form = {
    querySelectorAll: () => [field, submit, safeClose],
  };
  const uploadLabel = fakeNode({ tagName: 'LABEL' });
  const upload = fakeNode({ tagName: 'INPUT' });
  upload.closest = () => uploadLabel;

  applyReadOnlyControlState(rootWith({ forms: [form], files: [upload] }), {
    readOnly: true,
    isMutableAction: () => false,
    isMutableFormSubmit: (candidate) => candidate === form,
  });

  assert.equal(field.disabled, true);
  assert.equal(submit.disabled, true);
  assert.equal(safeClose.disabled, false, 'safe dialog controls stay usable');
  assert.equal(upload.disabled, true);
  assert.equal(uploadLabel.getAttribute('data-readonly-disabled'), 'true');
});

test('normal workspaces are untouched', () => {
  const addJob = fakeNode({ action: 'new-job' });
  applyReadOnlyControlState(rootWith({ actions: [addJob] }), {
    readOnly: false,
    isMutableAction: () => true,
    isMutableFormSubmit: () => true,
  });
  assert.equal(addJob.disabled, false);
  assert.equal(addJob.getAttribute('data-readonly-disabled'), undefined);
});

test('submit buttons outside their target form are disabled too', () => {
  const targetForm = { querySelectorAll: () => [] };
  const save = fakeNode({ tagName: 'BUTTON' });
  save.setAttribute('form', 'underwriting-form');
  applyReadOnlyControlState(rootWith({
    externalSubmits: [save],
    formById: (id) => id === 'underwriting-form' ? targetForm : null,
  }), {
    readOnly: true,
    isMutableAction: () => false,
    isMutableFormSubmit: (form) => form === targetForm,
  });
  assert.equal(save.disabled, true);
  assert.equal(save.getAttribute('data-readonly-disabled'), 'true');
});
