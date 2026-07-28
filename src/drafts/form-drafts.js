const SENSITIVE_FIELD_PATTERN = /(password|passwd|token|secret|credential|api[_-]?key|access[_-]?key|refresh[_-]?key)/i;
const EXCLUDED_CONTROL_TYPES = new Set(['button', 'file', 'image', 'password', 'reset', 'submit']);
export const FORM_DRAFT_PREFIX = 'questbase.form-draft.v1';
export const FORM_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const FORM_DRAFT_VERSION = 1;

function controlList(controls) {
  if (!controls) return [];
  if (typeof controls[Symbol.iterator] === 'function') return [...controls];
  return Array.from(controls);
}

function isDraftableControl(control) {
  const name = String(control?.name || '').trim();
  const type = String(control?.type || '').toLowerCase();
  return !!name
    && !control.disabled
    && control.dataset?.draftIgnore === undefined
    && !SENSITIVE_FIELD_PATTERN.test(name)
    && !EXCLUDED_CONTROL_TYPES.has(type);
}

export function createFormDraftContext({
  profileId = '',
  companyId = '',
  workspaceId = '',
  formType = '',
  recordId = 'new',
} = {}) {
  return {
    profileId: String(profileId || '').trim(),
    companyId: String(companyId || '').trim(),
    workspaceId: String(workspaceId || '').trim(),
    formType: String(formType || '').trim().toLowerCase(),
    recordId: String(recordId || 'new').trim() || 'new',
  };
}

export function formDraftContextFromDataset(dataset = {}, profileId = '') {
  return createFormDraftContext({
    profileId,
    companyId: dataset.draftCompanyId,
    workspaceId: dataset.draftWorkspaceId,
    formType: dataset.draftType,
    recordId: dataset.draftRecordId,
  });
}

export function draftStatusView(state = 'idle', timeLabel = '') {
  const views = {
    idle: { label: 'Drafts save automatically', tone: 'idle' },
    saving: { label: 'Saving draft…', tone: 'saving' },
    saved: {
      label: `Draft saved locally${timeLabel ? ` · ${timeLabel}` : ''}`,
      tone: 'saved',
    },
    restored: { label: 'Local draft restored', tone: 'restored' },
    discarded: { label: 'Local draft discarded', tone: 'idle' },
    unavailable: { label: 'Local draft saving unavailable', tone: 'unavailable' },
  };
  return views[state] || views.idle;
}

export function draftStorageKey(context) {
  const normalized = createFormDraftContext(context);
  return [
    FORM_DRAFT_PREFIX,
    normalized.profileId,
    normalized.companyId,
    normalized.workspaceId,
    normalized.formType,
    normalized.recordId,
  ].map((part) => encodeURIComponent(part)).join(':');
}

export function createDraftStore({
  storage,
  now = () => Date.now(),
  ttlMs = FORM_DRAFT_TTL_MS,
} = {}) {
  function remove(context) {
    if (!storage) return { ok: false, error: new Error('Draft storage unavailable') };
    try {
      storage.removeItem(draftStorageKey(context));
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }

  function write(context, values) {
    if (!storage) return { ok: false, error: new Error('Draft storage unavailable') };
    const draft = {
      version: FORM_DRAFT_VERSION,
      updatedAt: now(),
      values: values && typeof values === 'object' ? values : {},
    };
    try {
      storage.setItem(draftStorageKey(context), JSON.stringify(draft));
      return { ok: true, draft };
    } catch (error) {
      return { ok: false, error };
    }
  }

  function read(context) {
    if (!storage) return { ok: false, draft: null, error: new Error('Draft storage unavailable') };
    const key = draftStorageKey(context);
    let raw;
    try {
      raw = storage.getItem(key);
    } catch (error) {
      return { ok: false, draft: null, error };
    }
    if (!raw) return { ok: true, draft: null };
    let draft;
    try {
      draft = JSON.parse(raw);
    } catch {
      remove(context);
      return { ok: true, draft: null };
    }
    const valid = draft
      && draft.version === FORM_DRAFT_VERSION
      && Number.isFinite(draft.updatedAt)
      && draft.values
      && typeof draft.values === 'object'
      && !Array.isArray(draft.values);
    if (!valid || now() - draft.updatedAt > ttlMs) {
      remove(context);
      return { ok: true, draft: null };
    }
    return { ok: true, draft };
  }

  function purgeProfile(profileId) {
    if (!storage) return { ok: false, removed: 0, error: new Error('Draft storage unavailable') };
    const prefix = `${encodeURIComponent(FORM_DRAFT_PREFIX)}:${encodeURIComponent(String(profileId || '').trim())}:`;
    try {
      const keys = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(prefix)) keys.push(key);
      }
      keys.forEach((key) => storage.removeItem(key));
      return { ok: true, removed: keys.length };
    } catch (error) {
      return { ok: false, removed: 0, error };
    }
  }

  return { read, write, remove, purgeProfile };
}

export function createFormDraftManager({
  store,
  delayMs = 800,
  setTimer = (callback, delay) => setTimeout(callback, delay),
  clearTimer = (timerId) => clearTimeout(timerId),
} = {}) {
  const pending = new Map();

  function read(context) {
    return store.read(context);
  }

  function capture(context, controls, onResult) {
    const key = draftStorageKey(context);
    const previous = pending.get(key);
    if (previous) clearTimer(previous.timerId);
    const entry = {
      context: createFormDraftContext(context),
      values: serializeDraftControls(controls),
      onResult,
      timerId: null,
    };
    entry.timerId = setTimer(() => {
      const current = pending.get(key);
      if (current !== entry) return;
      pending.delete(key);
      const result = store.write(entry.context, entry.values);
      entry.onResult?.(result);
    }, delayMs);
    pending.set(key, entry);
    return { ok: true, pending: true };
  }

  function flush(context) {
    const key = draftStorageKey(context);
    const entry = pending.get(key);
    if (!entry) return { ok: true, pending: false };
    clearTimer(entry.timerId);
    pending.delete(key);
    const result = store.write(entry.context, entry.values);
    entry.onResult?.(result);
    return result;
  }

  function clear(context) {
    const key = draftStorageKey(context);
    const entry = pending.get(key);
    if (entry) {
      clearTimer(entry.timerId);
      pending.delete(key);
    }
    return store.remove(context);
  }

  function flushAll() {
    const results = [...pending.values()].map((entry) => flush(entry.context));
    return {
      ok: results.every((result) => result.ok),
      results,
    };
  }

  function restore(context, controls) {
    const result = store.read(context);
    if (result.ok && result.draft) restoreDraftControls(controls, result.draft.values);
    return result;
  }

  function purgeProfile(profileId) {
    const normalizedProfileId = String(profileId || '').trim();
    [...pending.entries()].forEach(([key, entry]) => {
      if (entry.context.profileId !== normalizedProfileId) return;
      clearTimer(entry.timerId);
      pending.delete(key);
    });
    return store.purgeProfile(normalizedProfileId);
  }

  return { capture, clear, flush, flushAll, purgeProfile, read, restore };
}

export function serializeDraftControls(controls) {
  const values = {};
  controlList(controls).forEach((control) => {
    if (!isDraftableControl(control)) return;
    const name = String(control.name).trim();
    const type = String(control.type || '').toLowerCase();
    if (type === 'checkbox') {
      values[name] = { kind: 'checkbox', checked: !!control.checked };
      return;
    }
    if (type === 'radio') {
      if (control.checked) values[name] = { kind: 'radio', value: String(control.value ?? '') };
      return;
    }
    values[name] = { kind: 'value', value: String(control.value ?? '') };
  });
  return values;
}

export function restoreDraftControls(controls, values = {}) {
  controlList(controls).forEach((control) => {
    if (!isDraftableControl(control)) return;
    const name = String(control.name).trim();
    const saved = values[name];
    if (!saved || typeof saved !== 'object') return;
    const type = String(control.type || '').toLowerCase();
    if (type === 'checkbox' && saved.kind === 'checkbox') {
      control.checked = !!saved.checked;
      return;
    }
    if (type === 'radio' && saved.kind === 'radio') {
      control.checked = String(control.value ?? '') === String(saved.value ?? '');
      return;
    }
    if (saved.kind === 'value') control.value = String(saved.value ?? '');
  });
}
