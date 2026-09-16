// The page a client fills in, holding nothing but a link.
//
// Fetched on demand and deliberately self-contained: the visitor is not signed in, has no
// company, no workspace and no session, so nothing in the application shell is of any use to
// them. It escapes its own markup and holds its own state rather than reaching into main.js --
// which is also what keeps it out of the entry bundle.
//
// It renders whatever /api/wb-intake-open returns and validates almost nothing itself. The
// server is the authority on which fields exist and what a valid answer is; a second copy of
// those rules here is a second copy to drift.

const h = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
));

let state = null;
let onChange = () => {};

const setState = (patch) => { state = { ...state, ...patch }; onChange(); };

// ---- the fields ------------------------------------------------------------------------------

function fieldControl(field) {
  const id = `if-${field.id}`;
  const required = field.required ? ' required' : '';
  const place = field.placeholder ? ` placeholder="${h(field.placeholder)}"` : '';
  const name = ` name="${h(field.id)}" id="${id}"`;

  switch (field.type) {
    case 'textarea':
      return `<textarea class="form-input" rows="4"${name}${place}${required}></textarea>`;
    case 'checkbox':
      return `<label class="intake-switch"><input type="checkbox"${name}><span>Yes</span></label>`;
    case 'date':
      return `<input class="form-input" type="date"${name}${required}>`;
    case 'email':
      return `<input class="form-input" type="email"${name}${place}${required}>`;
    case 'phone':
      return `<input class="form-input" type="tel"${name}${place}${required}>`;
    case 'number':
    case 'money':
    case 'duration':
    case 'rating': {
      const extra = field.type === 'rating' ? ' min="0" max="5" step="1"' : '';
      return `<input class="form-input" type="number" inputmode="decimal"${extra}${name}${place}${required}>`;
    }
    case 'category':
    case 'status': {
      const options = (field.options || [])
        .map((option) => `<option value="${h(option.id)}">${h(option.label)}</option>`).join('');
      return `<select class="form-input"${name}${required}><option value="">Choose…</option>${options}</select>`;
    }
    case 'tags':
      return `<div class="intake-tags">${(field.options || []).map((option) => `
        <label class="intake-tag"><input type="checkbox" data-tag="${h(field.id)}" value="${h(option.id)}"><span>${h(option.label)}</span></label>
      `).join('')}</div>`;
    default:
      return `<input class="form-input" type="text"${name}${place}${required}>`;
  }
}

const unitNote = (field) => {
  const note = field.type === 'money' ? (field.currency || '$') : field.unit;
  return note ? ` <small class="intake-unit">${h(note)}</small>` : '';
};

function fieldRow(field) {
  return `
    <div class="intake-field">
      <label for="if-${h(field.id)}">${h(field.label)}${field.required ? ' <span class="intake-req">*</span>' : ''}${unitNote(field)}</label>
      ${fieldControl(field)}
    </div>
  `;
}

// ---- reading the form back ---------------------------------------------------------------------

function collect(root, fields) {
  const values = {};
  fields.forEach((field) => {
    if (field.type === 'tags') {
      const picked = [...root.querySelectorAll(`[data-tag="${CSS.escape(field.id)}"]:checked`)].map((el) => el.value);
      if (picked.length) values[field.id] = picked;
      return;
    }
    const el = root.querySelector(`[name="${CSS.escape(field.id)}"]`);
    if (!el) return;
    if (field.type === 'checkbox') { values[field.id] = el.checked; return; }
    const text = String(el.value || '').trim();
    if (text) values[field.id] = text;
  });
  return values;
}

// ---- the three screens ---------------------------------------------------------------------------

function gate() {
  return `
    <section class="client-portal-gate">
      <h1>${h(state.link?.title || 'Enter the passcode')}</h1>
      <p>This form is private. Enter the 6-character passcode you were given.</p>
      <form data-intake-gate autocomplete="off">
        <input class="form-input intake-code" name="passcode" maxlength="12" autocapitalize="characters"
               spellcheck="false" placeholder="ABC234" aria-label="Passcode" ${state.busy ? 'disabled' : ''}>
        ${state.error ? `<div class="form-message error">${h(state.error)}</div>` : ''}
        <button class="btn btn-primary" type="submit" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Checking…' : 'Open the form'}</button>
      </form>
    </section>
  `;
}

function form() {
  const link = state.link || {};
  return `
    <section class="client-portal-gate intake-form-card">
      <h1>${h(link.title || 'Tell us about the job')}</h1>
      ${link.intro ? `<p>${h(link.intro)}</p>` : ''}
      <form data-intake-form autocomplete="off">
        ${(state.fields || []).map(fieldRow).join('')}
        <div class="intake-field">
          <label for="if-your-name">Your name</label>
          <input class="form-input" type="text" id="if-your-name" name="__name" autocomplete="name">
        </div>
        <div class="intake-field">
          <label for="if-your-email">Your email</label>
          <input class="form-input" type="email" id="if-your-email" name="__email" autocomplete="email">
        </div>
        <!-- Not display:none: some bots skip anything hidden that way. Off-screen and
             aria-hidden, so a human never sees it and a screen reader never reads it. -->
        <div class="intake-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
        ${state.error ? `<div class="form-message error">${h(state.error)}</div>` : ''}
        <button class="btn btn-primary" type="submit" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Sending…' : 'Send'}</button>
      </form>
    </section>
  `;
}

const thanks = () => `
  <section class="client-portal-gate">
    <h1>Thank you</h1>
    <p>Your answers have been sent. There is nothing else to do — somebody will be in touch.</p>
  </section>
`;

const failed = () => `
  <section class="client-portal-gate">
    <h1>This form is not available</h1>
    <p>${h(state.fatal)}</p>
  </section>
`;

export function renderIntakePage() {
  if (!state) return '<main class="client-portal-public"><section class="client-portal-gate loading"><h1>Opening form</h1></section></main>';
  let body;
  if (state.fatal) body = failed();
  else if (state.done) body = thanks();
  else if (state.fields?.length) body = form();
  else if (state.link?.needsPasscode) body = gate();
  else body = '<section class="client-portal-gate loading"><h1>Opening form</h1></section>';
  // NOT `open`. That modifier exists for the client-portal document annotator, which is a
  // fixed full-screen shell that scrolls inside itself: it carries position:fixed, inset:0
  // and overflow:hidden. Worn by a page that is simply a long card, it pinned the form to the
  // viewport and threw away everything below the fold -- an intake form of any real length
  // could not be filled in, because it could not be reached. The base class is a normal
  // scrolling page (min-height:100vh), which is what every other public page here uses.
  return `<main class="client-portal-public intake-public">${body}</main>`;
}

// ---- talking to the two routes ---------------------------------------------------------------

async function call(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'This form could not be opened.');
  return payload;
}

export async function openIntake(token) {
  state = { token, startedAt: new Date().toISOString(), passcode: '' };
  onChange();
  try {
    const out = await call(`/api/wb-intake-open?token=${encodeURIComponent(token)}`);
    setState({ link: out.link, fields: out.fields || [] });
  } catch (error) {
    setState({ fatal: error.message });
  }
}

async function unlock(passcode) {
  setState({ busy: true, error: '' });
  try {
    const out = await call('/api/wb-intake-open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: state.token, passcode }),
    });
    // Held so the submit can present it again: the gate is enforced on both routes, and the
    // page must not be able to open a private form it then cannot send.
    setState({ busy: false, link: out.link, fields: out.fields || [], passcode });
  } catch (error) {
    setState({ busy: false, error: error.message });
  }
}

async function submit(root) {
  setState({ busy: true, error: '' });
  const values = collect(root, state.fields || []);
  const named = (name) => root.querySelector(`[name="${name}"]`)?.value || '';
  try {
    await call('/api/wb-intake-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: state.token,
        passcode: state.passcode,
        values,
        name: named('__name'),
        email: named('__email'),
        website: named('website'),
        started_at: state.startedAt,
      }),
    });
    setState({ busy: false, done: true });
  } catch (error) {
    setState({ busy: false, error: error.message });
  }
}

/** One delegated listener for the whole page, so re-rendering never leaves a dead handler. */
export function mountIntakePage(token, rerender) {
  onChange = rerender;
  if (!mountIntakePage.bound) {
    mountIntakePage.bound = true;
    document.addEventListener('submit', (event) => {
      const gateForm = event.target.closest?.('[data-intake-gate]');
      const mainForm = event.target.closest?.('[data-intake-form]');
      if (!gateForm && !mainForm) return;
      event.preventDefault();
      if (state?.busy) return;
      if (gateForm) unlock(gateForm.querySelector('[name="passcode"]')?.value || '');
      else submit(mainForm);
    });
  }
  if (state?.token !== token) openIntake(token);
}
