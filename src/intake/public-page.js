// The page a client fills in, holding nothing but a link.
//
// Fetched on demand and deliberately self-contained: the visitor is not signed in, has no
// company, no workspace and no session, so nothing in the application shell is of any use to
// them. It escapes its own markup and holds its own state rather than reaching into main.js --
// which is also what keeps it out of the entry bundle. Its stylesheet rides with it
// (./public-page-module.js), for the same reason.
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
//
// Each control asks its question the way the app's own "Add record" form does
// (src/workspace/field-config-ui.js): the same placeholders, the same phone formatting, the pin
// beside a location, a currency before money, hours and minutes for a duration, stars for a
// rating. Somebody filling this in from a link is answering the same questions as somebody
// adding the record by hand, and should not meet a rougher version of them.
//
// One deliberate difference, because a stranger is not a member: a category is a fixed list.
// The record form lets a member type a new option; here the server refuses one
// (api/_lib/intake.js), so offering the box would only produce an error.

const chipsFor = (field) => (field.type === 'category' || field.type === 'status')
  && field.display === 'chips' && (field.options || []).length > 0;

// A question answered by a group of controls has no single element for its label to point at,
// so the label names the group instead.
const isGroup = (field) => field.type === 'rating' || field.type === 'tags' || chipsFor(field);

function fieldControl(field) {
  const id = `if-${h(field.id)}`;
  const name = ` name="${h(field.id)}" id="${id}"`;
  const required = field.required ? ' required' : '';
  const own = field.placeholder ? ` placeholder="${h(field.placeholder)}"` : '';

  switch (field.type) {
    case 'textarea':
      return `<textarea class="intake-input" rows="4"${name}${own}${required}></textarea>`;
    case 'email':
      return `<input class="intake-input" type="email" autocomplete="email"${name} placeholder="name@email.com"${required}>`;
    // data-phone-format is handled by the document-level input listener in main.js, which runs
    // on this route too: the same formatting as every phone box in the app.
    case 'phone':
      return `<input class="intake-input" type="tel" inputmode="tel" autocomplete="tel" data-phone-format${name} placeholder="555 123 4567"${required}>`;
    // The pin opens a map (./map-picker.js, fetched on first press along with Leaflet), as the pin
    // beside a location does in the app. It writes the address into this box, which is all a
    // location field stores.
    case 'location':
      return `<div class="intake-affix">
        <button type="button" class="intake-affix-ic intake-pin" data-intake-pin="${h(field.id)}" title="Pick on a map" aria-label="${h(`Pick ${field.label || 'the location'} on a map`)}"><i class="ti ti-map-pin" aria-hidden="true"></i></button>
        <input class="intake-input" type="text" autocomplete="street-address"${name} placeholder="Address, city, or place"${required}>
      </div>`;
    case 'date':
      return `<input class="intake-input intake-short" type="date"${name}${required}>`;
    case 'number':
      return `<div class="intake-inline">
        <input class="intake-input intake-short" type="text" inputmode="numeric" data-digits-only${name}${required}>
        ${field.unit ? `<span class="intake-suffix">${h(field.unit)}</span>` : ''}
      </div>`;
    case 'money':
      return `<div class="intake-affix intake-short">
        <span class="intake-affix-ic" aria-hidden="true">${h(field.currency || '$')}</span>
        <input class="intake-input" type="number" step="0.01" inputmode="decimal"${name}${required}>
      </div>`;
    // Stored as whole minutes, as the record form stores it. A single box here used to take the
    // number as minutes whatever the visitor meant, so "2" for two hours arrived as two minutes.
    // Not `required` in the browser: that would refuse "45 mins" with no hours. The server
    // enforces a required duration.
    case 'duration':
      return `<div class="intake-inline">
        <input class="intake-input intake-tiny" type="number" min="0" inputmode="numeric" placeholder="0" id="${id}" data-dur-h="${h(field.id)}" aria-label="Hours"><span class="intake-suffix">hrs</span>
        <input class="intake-input intake-tiny" type="number" min="0" max="59" inputmode="numeric" placeholder="0" data-dur-m="${h(field.id)}" aria-label="Minutes"><span class="intake-suffix">mins</span>
      </div>`;
    case 'checkbox':
      return `<label class="intake-toggle"><input type="checkbox"${name}><span class="intake-toggle-track" aria-hidden="true"></span></label>`;
    // Radios, drawn as stars. Native choice, reachable by keyboard, read back with :checked; the
    // fill comes from CSS. Laid out 5..1 and reversed on screen so "this star and every one
    // before it" is a sibling selector.
    case 'rating':
      return `<div class="intake-stars" role="radiogroup" aria-labelledby="${id}-label">${[5, 4, 3, 2, 1].map((n) => `
        <input type="radio" id="${id}-${n}" name="${h(field.id)}" value="${n}"${n === 5 ? required : ''}>
        <label for="${id}-${n}" title="${n} star${n === 1 ? '' : 's'}"><i class="ti ti-star-filled" aria-hidden="true"></i><span class="intake-sr">${n} star${n === 1 ? '' : 's'}</span></label>`).join('')}
      </div>`;
    case 'category':
    case 'status': {
      const options = field.options || [];
      if (chipsFor(field)) {
        return `<div class="intake-chips" role="radiogroup" aria-labelledby="${id}-label">${options.map((option, i) => `
          <label class="intake-chip"><input type="radio" name="${h(field.id)}" value="${h(option.id)}"${i === 0 ? required : ''}><span${option.color ? ` style="--chip:${h(option.color)}"` : ''}>${h(option.label)}</span></label>`).join('')}
        </div>`;
      }
      const noun = String(field.label || 'value').toLowerCase();
      return `<div class="intake-select">
        <select class="intake-input"${name}${required}><option value="">${h(`Pick a ${noun}`)}</option>${options
          .map((option) => `<option value="${h(option.id)}">${h(option.label)}</option>`).join('')}</select>
        <i class="ti ti-chevron-down" aria-hidden="true"></i>
      </div>`;
    }
    case 'tags':
      return `<div class="intake-chips" role="group" aria-labelledby="${id}-label">${(field.options || []).map((option) => `
        <label class="intake-chip"><input type="checkbox" data-tag="${h(field.id)}" value="${h(option.id)}"><span${option.color ? ` style="--chip:${h(option.color)}"` : ''}>${h(option.label)}</span></label>`).join('')}
      </div>`;
    default:
      return `<input class="intake-input" type="text"${name}${own}${required}>`;
  }
}

function fieldRow(field) {
  const id = `if-${h(field.id)}`;
  const mark = field.required ? '<span class="intake-req" aria-hidden="true">*</span>' : '';
  const label = isGroup(field)
    ? `<span class="intake-label" id="${id}-label">${h(field.label)}${mark}</span>`
    : `<label class="intake-label" id="${id}-label" for="${id}">${h(field.label)}${mark}</label>`;
  return `<div class="intake-q">${label}${fieldControl(field)}</div>`;
}

// ---- reading the form back ---------------------------------------------------------------------

/** Hours and minutes, as the record form stores a duration: whole minutes, or '' if neither. */
export function durationMinutes(hours, minutes) {
  const hText = String(hours ?? '').trim();
  const mText = String(minutes ?? '').trim();
  if (!hText && !mText) return '';
  const whole = (text) => Math.max(0, Math.floor(Number(text) || 0));
  return whole(hText) * 60 + whole(mText);
}

function collect(root, fields) {
  const values = {};
  fields.forEach((field) => {
    const key = CSS.escape(field.id);
    if (field.type === 'tags') {
      const picked = [...root.querySelectorAll(`[data-tag="${key}"]:checked`)].map((el) => el.value);
      if (picked.length) values[field.id] = picked;
      return;
    }
    if (field.type === 'duration') {
      const minutes = durationMinutes(
        root.querySelector(`[data-dur-h="${key}"]`)?.value,
        root.querySelector(`[data-dur-m="${key}"]`)?.value,
      );
      if (minutes !== '') values[field.id] = minutes;
      return;
    }
    // A radio group (stars, chips) answers with its checked member. Anything else is the one
    // element with that name -- which for a checkbox is there whether ticked or not.
    const el = root.querySelector(`[name="${key}"]:checked`) || root.querySelector(`[name="${key}"]:not([type="radio"])`);
    if (!el) return;
    if (field.type === 'checkbox') { values[field.id] = el.checked; return; }
    const text = String(el.value || '').trim();
    if (text) values[field.id] = text;
  });
  return values;
}

// ---- the screens ---------------------------------------------------------------------------------

// The app's own icon and colour at the top, as the record form's header draws them. A private
// link shows neither before its passcode: the server withholds the app until then, so the
// header falls back to a plain form mark.
function header(link, { intro = true } = {}) {
  const icon = /^ti-[a-z0-9-]+$/.test(String(link.icon || '')) ? link.icon : 'ti-forms';
  return `<header class="intake-head">
    <span class="intake-app-ic"${link.color ? ` style="background:${h(link.color)}"` : ''}><i class="ti ${h(icon)}" aria-hidden="true"></i></span>
    <div class="intake-head-text">
      <h1>${h(link.title || 'Tell us about the job')}</h1>
      ${intro && link.intro ? `<p class="intake-intro">${h(link.intro)}</p>` : ''}
    </div>
  </header>`;
}

const errorLine = () => (state.error
  ? `<div class="intake-error" role="alert"><i class="ti ti-alert-circle" aria-hidden="true"></i><span>${h(state.error)}</span></div>`
  : '');

function gate() {
  return `<section class="intake-card intake-card-narrow">
    ${header(state.link || {}, { intro: false })}
    <div class="intake-state">
      <span class="intake-state-ic"><i class="ti ti-lock" aria-hidden="true"></i></span>
      <p>This form is private. Enter the passcode you were given.</p>
      <form data-intake-gate class="intake-gate-form" autocomplete="off">
        <input class="intake-input intake-code" name="passcode" maxlength="32" autocapitalize="characters"
               spellcheck="false" placeholder="ABC234" aria-label="Passcode" ${state.busy ? 'disabled' : ''}>
        ${errorLine()}
        <button class="btn btn-primary intake-send" type="submit" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Checking…' : 'Open the form'}</button>
      </form>
    </div>
  </section>`;
}

function form() {
  const fields = state.fields || [];
  return `<section class="intake-card">
    ${header(state.link || {})}
    <form data-intake-form class="intake-form" autocomplete="off">
      ${fields.some((field) => field.required) ? '<p class="intake-note"><span class="intake-req" aria-hidden="true">*</span> Required</p>' : ''}
      ${fields.map(fieldRow).join('')}
      <!-- Not display:none: some bots skip anything hidden that way. Off-screen and
           aria-hidden, so a human never sees it and a screen reader never reads it. -->
      <div class="intake-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
      ${errorLine()}
      <div class="intake-actions">
        <button class="btn btn-primary intake-send" type="submit" ${state.busy ? 'disabled' : ''}><i class="ti ti-send" aria-hidden="true"></i>${state.busy ? 'Sending…' : 'Send'}</button>
      </div>
    </form>
  </section>`;
}

const stateCard = (icon, tone, title, text) => `<section class="intake-card intake-card-narrow">
  <div class="intake-state">
    <span class="intake-state-ic ${tone}"><i class="ti ${icon}" aria-hidden="true"></i></span>
    <h1>${h(title)}</h1>
    <p>${h(text)}</p>
  </div>
</section>`;

const loading = () => `<section class="intake-card intake-card-narrow" aria-busy="true">
  <div class="intake-state"><span class="intake-spinner" aria-hidden="true"></span><h1>Opening form</h1></div>
</section>`;

export function renderIntakePage() {
  let body;
  if (!state) body = loading();
  else if (state.fatal) body = stateCard('ti-alert-circle', 'bad', 'This form is not available', state.fatal);
  else if (state.done) body = stateCard('ti-circle-check', 'ok', 'Thank you', 'Your answers have been sent. There is nothing else to do — somebody will be in touch.');
  else if (state.fields?.length) body = form();
  else if (state.link?.needsPasscode) body = gate();
  else body = loading();
  return `<main class="client-portal-public intake-public">${body}<p class="intake-foot">Powered by Questbase</p></main>`;
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

// The form is NOT redrawn while it sends, or when the server turns it back. The page redraws
// from innerHTML, so a redraw rebuilds every box empty: a rejected submission used to throw away
// everything the visitor had typed, and a pinned location with it. Only the Send button and the
// error line change, in place. A success does redraw, because the form is finished with.
function paintSending(root, busy, message) {
  const button = root.querySelector('.intake-send');
  if (button) {
    button.disabled = busy;
    button.innerHTML = `<i class="ti ti-send" aria-hidden="true"></i>${busy ? 'Sending…' : 'Send'}`;
  }
  root.querySelector('.intake-error')?.remove();
  if (message) {
    root.querySelector('.intake-actions')?.insertAdjacentHTML('beforebegin',
      `<div class="intake-error" role="alert"><i class="ti ti-alert-circle" aria-hidden="true"></i><span>${h(message)}</span></div>`);
  }
}

// No "your name" or "your email" of its own any more. The form asks exactly what the app's
// record form asks, so an app with a Name and an Email field was asking for both twice. Who sent
// a submission is read back from those answers in the review list (src/intake/manage.js).
async function submit(root) {
  state.busy = true;
  state.error = '';
  paintSending(root, true, '');
  const values = collect(root, state.fields || []);
  try {
    await call('/api/wb-intake-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: state.token,
        passcode: state.passcode,
        values,
        website: root.querySelector('[name="website"]')?.value || '',
        started_at: state.startedAt,
      }),
    });
    setState({ busy: false, done: true });
  } catch (error) {
    state.busy = false;
    state.error = error.message;
    paintSending(root, false, error.message);
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
    document.addEventListener('click', (event) => {
      const pin = event.target.closest?.('[data-intake-pin]');
      if (!pin) return;
      event.preventDefault();
      const input = pin.closest('.intake-affix')?.querySelector('input');
      import('./map-picker.js')
        .then((mod) => mod.openMapPicker(input, pin))
        .catch(() => {
          // Say so on the pin rather than doing nothing: the box beside it still takes a typed address.
          pin.disabled = true;
          pin.title = 'The map could not load. Type the address instead.';
        });
    });
  }
  if (state?.token !== token) openIntake(token);
}
