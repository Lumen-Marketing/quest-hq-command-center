// Intake links, from the side of the person who makes them.
//
// Fetched on the first press of "Share link": every session that never shares a form was
// carrying this for nothing, and the entry bundle has no room to spare.
//
// The row is inserted BY THE CLIENT, not by an endpoint. RLS on wb_intake_links requires
// workspaces.manage, so the database is the only thing deciding who may create a link -- and
// the passcode hash is derived here (src/intake/passcode.js) precisely so that no server route
// has to re-answer that question. See the note in api/_lib/intake.js.

import { opsWorkspaceId } from '../workspace/builder-core.js';
import { generatePasscode, generateToken, hashPasscode, makePasscodeSalt } from './passcode.js';

let ctx = null;
let view = null;

const h = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
));

const linkUrl = (token) => `${window.location.origin}/intake/${encodeURIComponent(token)}`;

// The types a stranger may fill. Kept in step with INTAKE_FIELD_TYPES in api/_lib/intake.js by
// tests/wb-intake-field-types.test.mjs -- the server is the enforcer, so a field offered here
// that the server refuses would produce a link whose fields silently never arrive.
export const INTAKE_FIELD_TYPES = [
  'text', 'textarea', 'number', 'money', 'date', 'category', 'status',
  'tags', 'email', 'phone', 'location', 'checkbox', 'duration', 'rating',
];

export const fillableFields = (app) => (app?.fields || [])
  .filter((field) => INTAKE_FIELD_TYPES.includes(field.type) && !field.hidden);

// ---- data ------------------------------------------------------------------------------------

async function client() {
  const supabase = ctx.createSupabaseClient();
  if (!supabase || !ctx.isLiveSupabaseSession()) throw new Error('Sharing a link needs a signed-in Questbase session.');
  return supabase;
}

async function loadAll() {
  const supabase = await client();
  const [links, subs] = await Promise.all([
    supabase.from('wb_intake_links').select('*').eq('company_id', view.companyId).eq('app_id', view.appId).order('created_at', { ascending: false }),
    supabase.from('wb_intake_submissions').select('*').eq('company_id', view.companyId).eq('app_id', view.appId).eq('status', 'pending').order('created_at', { ascending: false }),
  ]);
  if (links.error) throw new Error(links.error.message);
  view.links = links.data || [];
  view.submissions = subs.error ? [] : (subs.data || []);
}

async function createLink({ visibility, title, intro, maxSubmissions }) {
  const supabase = await client();
  const token = generateToken();
  const row = {
    token,
    company_id: view.companyId,
    // The uuid, not the `ws-` builder key: the column is a uuid and the row's permission is
    // decided from it. See opsWorkspaceId.
    workspace_id: opsWorkspaceId(view.workspaceId),
    app_id: view.appId,
    title: title || `${view.app.name} — tell us about the job`,
    intro: intro || '',
    visibility,
    field_ids: [],
    max_submissions: maxSubmissions || null,
  };
  let passcode = '';
  if (visibility === 'private') {
    passcode = generatePasscode();
    row.passcode_salt = makePasscodeSalt();
    row.passcode_hash = await hashPasscode(passcode, row.passcode_salt);
  }
  const { error } = await supabase.from('wb_intake_links').insert(row);
  if (error) throw new Error(error.message);
  // Shown once, here, and never again: only the hash is stored, so there is nothing to read
  // back. Regenerating is the recovery, which is the correct behaviour for a shared secret.
  view.justMade = { token, passcode };
}

async function setStatus(token, status) {
  const supabase = await client();
  const { error } = await supabase.from('wb_intake_links').update({ status }).eq('token', token);
  if (error) throw new Error(error.message);
}

async function removeLink(token) {
  const supabase = await client();
  const { error } = await supabase.from('wb_intake_links').delete().eq('token', token);
  if (error) throw new Error(error.message);
}

/** Accepting is what finally writes a record -- through the app's own save, as a member, with
 *  every permission that normally applies. The public half never touches the document. */
async function accept(id) {
  const submission = view.submissions.find((item) => item.id === id);
  if (!submission) return;
  const { app } = ctx.wbFind(view.companyId, view.workspaceId, view.appId);
  if (!app) throw new Error('This app is no longer here.');
  const stamp = new Date().toISOString();
  app.items = Array.isArray(app.items) ? app.items : [];
  const item = {
    id: ctx.wbUid(),
    values: { ...submission.values },
    children: {},
    createdAt: stamp,
    updatedAt: stamp,
    lastActivityAt: stamp,
    comments: [],
  };
  app.items.unshift(item);
  await ctx.wbSave(view.companyId);

  const supabase = await client();
  await supabase.from('wb_intake_submissions')
    .update({ status: 'accepted', accepted_item_id: item.id, reviewed_at: stamp })
    .eq('id', id);
  view.submissions = view.submissions.filter((row) => row.id !== id);
  ctx.showToast(`Added to ${app.name}.`, 'local', 'Workspaces');
}

// Not `reject`: main.js calls a promise's own reject, and a module-level function of that name
// reads to tests/extracted-module-references.test.mjs as a body lifted out of main.js that
// main.js still calls -- the exact bug that check exists to catch.
async function discardSubmission(id) {
  const supabase = await client();
  await supabase.from('wb_intake_submissions')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', id);
  view.submissions = view.submissions.filter((row) => row.id !== id);
}

// ---- markup ----------------------------------------------------------------------------------

function linkRow(link) {
  const paused = link.status !== 'active';
  const used = link.max_submissions
    ? `${link.submission_count} of ${link.max_submissions}`
    : `${link.submission_count}`;
  return `
    <div class="intake-link-row${paused ? ' paused' : ''}">
      <div class="intake-link-main">
        <strong>${h(link.title || 'Intake link')}</strong>
        <code>${h(linkUrl(link.token))}</code>
        <small>
          ${link.visibility === 'private' ? '<i class="ti ti-lock"></i> Passcode' : '<i class="ti ti-world"></i> Anyone with the link'}
          · ${h(used)} filled in${paused ? ' · paused' : ''}
        </small>
      </div>
      <div class="intake-link-actions">
        <button class="btn" data-intake-copy="${h(link.token)}"><i class="ti ti-copy"></i>Copy</button>
        <button class="btn" data-intake-toggle="${h(link.token)}">${paused ? 'Resume' : 'Pause'}</button>
        <button class="btn danger" data-intake-delete="${h(link.token)}"><i class="ti ti-trash"></i></button>
      </div>
    </div>
  `;
}

function submissionRow(submission) {
  const byId = new Map((view.app?.fields || []).map((field) => [field.id, field]));
  const cells = Object.entries(submission.values || {}).slice(0, 6).map(([id, value]) => {
    const field = byId.get(id);
    if (!field) return '';
    const options = field.config?.options || [];
    const shown = Array.isArray(value)
      ? value.map((v) => options.find((o) => o.id === v)?.label || v).join(', ')
      : (options.find((o) => o.id === value)?.label ?? (value === true ? 'Yes' : value === false ? 'No' : value));
    return `<span><b>${h(field.label)}</b> ${h(shown)}</span>`;
  }).join('');
  return `
    <div class="intake-sub-row">
      <div class="intake-sub-main">
        <strong>${h(submission.submitted_name || 'Someone')}</strong>
        ${submission.submitted_email ? `<small>${h(submission.submitted_email)}</small>` : ''}
        <div class="intake-sub-values">${cells}</div>
      </div>
      <div class="intake-link-actions">
        <button class="btn btn-primary" data-intake-accept="${h(submission.id)}"><i class="ti ti-check"></i>Add record</button>
        <button class="btn" data-intake-reject="${h(submission.id)}">Discard</button>
      </div>
    </div>
  `;
}

export function renderIntakeManage() {
  if (!view) return '';
  const made = view.justMade;
  return `
    <div class="modal-backdrop" data-intake-close></div>
    <div class="modal wb-modal intake-manage" role="dialog" aria-label="Share link">
      <header class="modal-head">
        <h2><i class="ti ti-link"></i> Share a link to ${h(view.app?.name || 'this app')}</h2>
        <button class="btn" data-intake-close><i class="ti ti-x"></i></button>
      </header>
      <div class="modal-body">
        <p class="muted">
          Anyone holding the link can fill in ${h(String(fillableFields(view.app).length))} of this app's fields without
          signing in. What they send waits here for you to add it as a record — nothing is written to the app until you do.
        </p>
        ${view.error ? `<div class="form-message error">${h(view.error)}</div>` : ''}
        ${made ? `
          <div class="form-message success intake-made">
            <strong>Link created.</strong>
            <code>${h(linkUrl(made.token))}</code>
            ${made.passcode ? `<div class="intake-code-out">Passcode <b>${h(made.passcode)}</b><small>Shown once. Only its hash is stored, so it cannot be read back — make another link if it is lost.</small></div>` : ''}
            <button class="btn" data-intake-copy="${h(made.token)}"><i class="ti ti-copy"></i>Copy link</button>
          </div>
        ` : ''}

        <form data-intake-create class="intake-create">
          <div class="intake-field">
            <label for="intake-title">What the client sees at the top</label>
            <input class="form-input" id="intake-title" name="title" placeholder="${h(view.app?.name || '')} — tell us about the job">
          </div>
          <div class="intake-field">
            <label for="intake-intro">A line of explanation (optional)</label>
            <input class="form-input" id="intake-intro" name="intro" placeholder="Two minutes. We will call you back the same day.">
          </div>
          <div class="intake-field">
            <label>Who can open it</label>
            <label class="intake-radio"><input type="radio" name="visibility" value="public" checked> <span><b>Public</b> — anyone with the link</span></label>
            <label class="intake-radio"><input type="radio" name="visibility" value="private"> <span><b>Private</b> — a 6-character passcode is required</span></label>
          </div>
          <div class="intake-field">
            <label for="intake-max">Stop after this many submissions (optional)</label>
            <input class="form-input" id="intake-max" name="max" type="number" min="1" placeholder="Leave empty for no limit">
          </div>
          <button class="btn btn-primary" type="submit" ${view.busy ? 'disabled' : ''}>${view.busy ? 'Creating…' : 'Create link'}</button>
        </form>

        <h3>Links</h3>
        ${view.links?.length ? view.links.map(linkRow).join('') : '<p class="muted">No links yet.</p>'}

        <h3>Waiting to be added ${view.submissions?.length ? `<span class="pill">${view.submissions.length}</span>` : ''}</h3>
        ${view.submissions?.length ? view.submissions.map(submissionRow).join('') : '<p class="muted">Nothing has been sent in yet.</p>'}
      </div>
    </div>
  `;
}

// ---- opening and driving it ----------------------------------------------------------------------

const redraw = () => ctx.render();

async function guard(work) {
  view.busy = true; view.error = ''; redraw();
  try { await work(); } catch (error) { view.error = error.message || String(error); }
  view.busy = false; redraw();
}

export function open(companyId, workspaceId, appId, context) {
  ctx = context;
  const { app } = ctx.wbFind(companyId, workspaceId, appId);
  view = { companyId, workspaceId, appId, app, links: [], submissions: [], busy: true };
  ctx.setIntakeView(view);
  bind();
  redraw();
  guard(loadAll);
}

export function close() {
  view = null;
  ctx.setIntakeView(null);
  redraw();
}

let bound = false;
function bind() {
  if (bound) return;
  bound = true;

  document.addEventListener('click', (event) => {
    if (!view) return;
    const hit = (name) => event.target.closest?.(`[data-intake-${name}]`);
    const value = (el, name) => el.getAttribute(`data-intake-${name}`);

    if (hit('close')) { event.preventDefault(); close(); return; }

    const copy = hit('copy');
    if (copy) {
      event.preventDefault();
      navigator.clipboard.writeText(linkUrl(value(copy, 'copy')))
        .then(() => ctx.showToast('Link copied.', 'local', 'Workspaces'))
        .catch(() => { view.error = 'Could not copy. Select the link and copy it by hand.'; redraw(); });
      return;
    }
    const toggle = hit('toggle');
    if (toggle) {
      event.preventDefault();
      const token = value(toggle, 'toggle');
      const link = view.links.find((row) => row.token === token);
      guard(async () => { await setStatus(token, link.status === 'active' ? 'paused' : 'active'); await loadAll(); });
      return;
    }
    const del = hit('delete');
    if (del) {
      event.preventDefault();
      const token = value(del, 'delete');
      // Deleting a link deletes what came through it, because the row is the parent. Worth
      // saying out loud rather than discovering afterwards.
      if (!window.confirm('Delete this link? Anyone holding it will no longer be able to open the form, and submissions still waiting here will go with it.')) return;
      guard(async () => { await removeLink(token); await loadAll(); });
      return;
    }
    const yes = hit('accept');
    if (yes) { event.preventDefault(); guard(() => accept(value(yes, 'accept'))); return; }
    const no = hit('reject');
    if (no) { event.preventDefault(); guard(() => discardSubmission(value(no, 'reject'))); }
  });

  document.addEventListener('submit', (event) => {
    if (!view) return;
    const form = event.target.closest?.('[data-intake-create]');
    if (!form) return;
    event.preventDefault();
    const read = (name) => String(form.querySelector(`[name="${name}"]`)?.value || '').trim();
    const visibility = form.querySelector('[name="visibility"]:checked')?.value === 'private' ? 'private' : 'public';
    guard(async () => {
      await createLink({
        visibility,
        title: read('title'),
        intro: read('intro'),
        maxSubmissions: Number(read('max')) || null,
      });
      await loadAll();
    });
  });
}
