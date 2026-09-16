// "make the fields on the share link form the same as the fields in Add record, and make the
// form more presentable"
//
// The public form asked its questions more roughly than the app's own record form: no
// placeholders, a phone box that took any text, a location with no pin, a single number box for
// a duration (so "2" meaning two hours arrived as two minutes) -- and two questions of its own,
// "Your name" and "Your email", which an app with Name and Email fields was asking twice.
//
// These render the real page against a stubbed API, rather than reading its source.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = await import('../src/intake/public-page.js');
const { normalizePasscode } = await import('../src/intake/passcode.js');
const { publicFields } = await import('../api/_lib/intake.js');
const { linkSummary } = await import('../api/_lib/intake-db.js');

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const appForm = read('../src/workspace/field-config-ui.js');

const LINK = {
  title: 'Client information — tell us about the job', intro: 'Two minutes.', appName: 'Client information',
  recordName: '', color: '#16a34a', icon: 'ti-users', needsPasscode: false,
};
const FIELDS = [
  { id: 'name', label: 'Name', type: 'text', required: true, placeholder: '' },
  { id: 'phone', label: 'Phone', type: 'phone', required: false, placeholder: '' },
  { id: 'email', label: 'Email', type: 'email', required: false, placeholder: '' },
  { id: 'where', label: 'Location', type: 'location', required: false, placeholder: '' },
  { id: 'time', label: 'Time on site', type: 'duration', required: false, placeholder: '' },
  { id: 'stars', label: 'Rating', type: 'rating', required: false, placeholder: '' },
  { id: 'cost', label: 'Budget', type: 'money', required: false, placeholder: '', currency: 'PHP' },
  { id: 'area', label: 'Area', type: 'number', required: false, placeholder: '', unit: 'sq ft' },
  { id: 'stage', label: 'Stage', type: 'status', required: false, placeholder: '', display: 'chips', options: [{ id: 's1', label: 'New', color: '#2563eb' }] },
  { id: 'trade', label: 'Trade', type: 'category', required: false, placeholder: '', options: [{ id: 't1', label: 'Roofing', color: '' }] },
  { id: 'insured', label: 'Insured', type: 'checkbox', required: false, placeholder: '' },
];

async function open(payload) {
  globalThis.fetch = async () => ({ ok: true, async json() { return payload; } });
  await page.openIntake(`tok-${Math.random()}`);
  return page.renderIntakePage();
}

// The markup of one question: from its label to the start of the next question.
const question = (html, id) => {
  const at = html.indexOf(`id="if-${id}-label"`);
  assert.ok(at > -1, `question ${id} is rendered`);
  const next = html.indexOf('class="intake-q"', at);
  return html.slice(at, next === -1 ? undefined : next);
};

// ---- the same questions ------------------------------------------------------------------------

test('it asks exactly the app’s questions, and none of its own', async () => {
  const html = await open({ link: LINK, fields: FIELDS });
  assert.equal((html.match(/class="intake-q"/g) || []).length, FIELDS.length, 'one question per field');
  for (const extra of ['Your name', 'Your email', '__name', '__email']) {
    assert.ok(!html.includes(extra), `the form no longer asks "${extra}" on top of the app’s fields`);
  }
  // The anti-spam gate is not a question, and stays.
  assert.ok(html.includes('name="website"'));
});

test('phone, email and location read as they do in Add record', async () => {
  const html = await open({ link: LINK, fields: FIELDS });
  const phone = question(html, 'phone');
  assert.ok(phone.includes('placeholder="555 123 4567"'));
  assert.ok(phone.includes('data-phone-format'), 'formatted as it is typed, by the listener every phone box in the app uses');
  assert.ok(phone.includes('type="tel"'));
  const email = question(html, 'email');
  assert.ok(email.includes('type="email"') && email.includes('placeholder="name@email.com"'));
  const where = question(html, 'where');
  assert.ok(where.includes('ti-map-pin'), 'a location has its pin');
  assert.ok(where.includes('placeholder="Address, city, or place"'));
});

test('the placeholders are the app’s own, so a change there shows up here as a failure', () => {
  // Parity with src/workspace/field-config-ui.js, which draws Add record. If the app changes one,
  // this form should change with it rather than quietly drift.
  const pageSource = read('../src/intake/public-page.js');
  for (const text of ['555 123 4567', 'name@email.com', 'Address, city, or place']) {
    assert.ok(appForm.includes(`placeholder="${text}"`), `Add record still says "${text}"`);
    assert.ok(pageSource.includes(`placeholder="${text}"`), 'and so does the public form');
  }
});

test('money has its currency before the box and a number its unit after', async () => {
  const html = await open({ link: LINK, fields: FIELDS });
  const money = question(html, 'cost');
  assert.ok(money.includes('<span class="intake-affix-ic" aria-hidden="true">PHP</span>'));
  assert.ok(money.includes('type="number" step="0.01"'));
  const area = question(html, 'area');
  assert.ok(area.includes('data-digits-only'));
  assert.ok(area.includes('<span class="intake-suffix">sq ft</span>'));
});

test('a duration is asked in hours and minutes and sent as whole minutes', async () => {
  const html = await open({ link: LINK, fields: FIELDS });
  const time = question(html, 'time');
  assert.ok(time.includes('data-dur-h="time"') && time.includes('data-dur-m="time"'));
  assert.ok(time.includes('>hrs<') && time.includes('>mins<'));
  // Minutes, as the record form stores a duration.
  assert.equal(page.durationMinutes('2', ''), 120, 'two hours is 120 minutes, not 2');
  assert.equal(page.durationMinutes('', '45'), 45);
  assert.equal(page.durationMinutes('1', '30'), 90);
  assert.equal(page.durationMinutes('', ''), '', 'nothing typed is no answer, not zero');
  assert.equal(page.durationMinutes('-3', '5'), 5, 'a negative hour is not subtracted');
});

test('a rating is five stars, a chips category is chips, and any other category a list', async () => {
  const html = await open({ link: LINK, fields: FIELDS });
  const stars = question(html, 'stars');
  assert.equal((stars.match(/name="stars" value="\d"/g) || []).length, 5);
  assert.ok(stars.includes('role="radiogroup"'));

  const stage = question(html, 'stage');
  assert.ok(stage.includes('type="radio" name="stage" value="s1"'), 'drawn as chips, as the app draws it');
  assert.ok(stage.includes('style="--chip:#2563eb"'), 'with the option’s own colour');

  const trade = question(html, 'trade');
  assert.ok(trade.includes('<select'), 'a fixed list: a stranger cannot add an option');
  assert.ok(trade.includes('Pick a trade'));
});

test('a question answered by a group labels the group, not a control that does not exist', async () => {
  const html = await open({ link: LINK, fields: FIELDS });
  assert.ok(html.includes('<span class="intake-label" id="if-stars-label">'));
  assert.ok(html.includes('<span class="intake-label" id="if-stage-label">'));
  assert.ok(html.includes('<label class="intake-label" id="if-phone-label" for="if-phone">'));
});

// ---- presentation ----------------------------------------------------------------------------------

test('the header carries the app’s own icon and colour, as Add record’s header does', async () => {
  const html = await open({ link: LINK, fields: FIELDS });
  assert.ok(html.includes('<span class="intake-app-ic" style="background:#16a34a"><i class="ti ti-users"'));
  assert.ok(html.includes('<h1>Client information — tell us about the job</h1>'));
  assert.ok(html.includes('<p class="intake-intro">Two minutes.</p>'));
  assert.ok(html.includes('<span class="intake-req" aria-hidden="true">*</span> Required'), 'says what the star means');
});

test('a private link shows a plain mark until its passcode, and takes as long a passcode as can be set', async () => {
  const html = await open({ link: { title: 'Private form', intro: '', needsPasscode: true }, fields: [] });
  assert.ok(html.includes('ti ti-forms'), 'no app icon before the gate, because none is sent');
  const max = Number((html.match(/name="passcode" maxlength="(\d+)"/) || [])[1]);
  // The share panel lets a member choose a passcode, normalised and capped at 32. A gate that
  // stopped typing at 12 made any longer one impossible to enter.
  assert.equal(max, normalizePasscode('A'.repeat(80)).length);
});

test('the page’s styles arrive with it and not in the entry stylesheet', () => {
  const main = read('../src/main.js');
  const wrapper = read('../src/intake/public-page-module.js');
  const entry = read('../src/styles.css');
  assert.ok(main.includes("import('./intake/public-page-module.js')"), 'the router fetches the page with its sheet');
  assert.ok(wrapper.includes("import './public-page.css';"));
  assert.ok(wrapper.includes("export * from './public-page.js';"));
  for (const rule of ['.intake-card {', '.intake-stars', '.intake-form-card', '.intake-tag {']) {
    assert.ok(!entry.includes(rule), `${rule} is not carried by every session`);
  }
  // Except the honeypot: if the page's sheet failed, a visible trap would be filled in by a
  // person, and their answers dropped as spam.
  assert.ok(entry.includes('.intake-trap {'));
});

test('the page is one colour from top to bottom, and still scrolls', () => {
  const css = read('../src/intake/public-page.css');
  const at = css.indexOf('.client-portal-public.intake-public {');
  assert.ok(at > -1);
  const rule = css.slice(at, css.indexOf('}', at));
  // Without a new formatting context the card's top margin escaped the page and showed a band
  // of the body's colour above it.
  assert.ok(rule.includes('display: flow-root'));
  assert.ok(rule.includes('min-height: 100vh'));
  assert.ok(!rule.includes('position: fixed') && !rule.includes('overflow: hidden'));
});

// ---- what the server sends ---------------------------------------------------------------------

test('the server says when a category is drawn as chips, and only then', () => {
  const app = { fields: [
    { id: 'a', label: 'Stage', type: 'status', config: { display: 'chips', options: [{ id: 'o', label: 'New' }] } },
    { id: 'b', label: 'Trade', type: 'category', config: { options: [{ id: 'o', label: 'Roof' }] } },
    { id: 'c', label: 'Tags', type: 'tags', config: { display: 'chips', options: [{ id: 'o', label: 'x' }] } },
  ] };
  const [stage, trade, tags] = publicFields(app);
  assert.equal(stage.display, 'chips');
  assert.equal(trade.display, undefined);
  assert.equal(tags.display, undefined, 'chips is a category style; tags are always chips here');
});

test('the link summary carries the app icon, checked, and none before a private link opens', () => {
  const link = { title: 'T', intro: '', visibility: 'public' };
  assert.equal(linkSummary(link, { icon: 'ti-users', color: '#16a34a' }).icon, 'ti-users');
  assert.equal(linkSummary(link, { icon: 'ti-users" onmouseover="x' }).icon, '', 'only a class name crosses');
  assert.equal(linkSummary({ ...link, visibility: 'private' }, null).icon, '');
});

// ---- the map picker ----------------------------------------------------------------------------
//
// "can you also make a map picker on the form link". The pin beside a location opens a map --
// search, this device's location, or a tap -- and the address lands in the Location box.

const picker = await import('../src/intake/map-picker.js');
const pickerSource = read('../src/intake/map-picker.js');
const pageSource = read('../src/intake/public-page.js');

test('the pin is a button that opens the map, and the map is fetched only when pressed', async () => {
  const html = await open({ link: LINK, fields: FIELDS });
  const where = question(html, 'where');
  assert.ok(where.includes('<button type="button" class="intake-affix-ic intake-pin" data-intake-pin="where"'));
  assert.ok(where.includes('aria-label="Pick Location on a map"'));
  assert.ok(pageSource.includes("import('./map-picker.js')"), 'loaded on the first press');
  assert.ok(!/^import .*map-picker/m.test(pageSource), 'and never statically, which would put it in the page chunk');
  assert.ok(!pageSource.includes('leaflet'), 'Leaflet is the picker\'s business, not the form\'s');
  assert.ok(pickerSource.includes("import('leaflet')"), 'and the picker loads it itself, only once opened');
});

test('it writes the address text into the form box, which is all a location field stores', () => {
  // A workspace location field holds the address and nothing else, even when a member pins it in
  // the app (saveLocationPicker in main.js writes `address` alone). The public picker must match,
  // or the record would hold a shape the app does not read.
  assert.ok(pickerSource.includes('input.value = chosen;'));
  assert.ok(pickerSource.includes("input.dispatchEvent(new Event('input', { bubbles: true }))"));
  assert.ok(!/name="(lat|lng)"/.test(pickerSource), 'no coordinates smuggled into the form beside it');
  assert.equal(picker.coordsLabel(33.4484, -112.074), '33.448400, -112.074000', 'a pin with no street address uses its coordinates');
});

test('it draws over the form rather than redrawing the page, and submits nothing of its own', () => {
  assert.ok(pickerSource.includes('document.body.append(dialog)'));
  assert.ok(!/onChange|setState|render\(/.test(pickerSource), 'a redraw would rebuild the form empty');
  // The page's submit listener sits on the document. A <form> in the dialog that it does not
  // recognise would submit past it and reload the page.
  assert.ok(!pickerSource.includes('<form'), 'Enter searches through a keydown, not a form');
});

test('it asks Nominatim politely', () => {
  const search = new URL(picker.searchUrl('  1 Main St, Phoenix  '));
  assert.equal(search.origin + search.pathname, 'https://nominatim.openstreetmap.org/search');
  assert.equal(search.searchParams.get('q'), '1 Main St, Phoenix');
  assert.equal(search.searchParams.get('limit'), '1');
  assert.equal(search.searchParams.get('format'), 'jsonv2');
  const reverse = new URL(picker.reverseUrl(33.4, -112.1));
  assert.equal(reverse.pathname, '/reverse');
  assert.equal(reverse.searchParams.get('lat'), '33.4');
  assert.equal(reverse.searchParams.get('lon'), '-112.1');
  // About a request a second and no search-as-you-type: searches are pressed, and a run of drags
  // settles into one lookup, whose answer is dropped if a newer pin has replaced it.
  const delay = Number((pickerSource.match(/REVERSE_DELAY_MS = (\d+)/) || [])[1]);
  assert.ok(delay >= 500, 'reverse lookups are debounced');
  assert.ok(pickerSource.includes('if (mine !== lookup || current !== dialog) return;'));
  assert.ok(!/addEventListener\('input'/.test(pickerSource), 'no lookup per keystroke');
});

test('the site policy still lets a visitor load tiles, look up addresses and share a location', () => {
  // All three are fetched straight from the visitor's browser. Tighten any of these in vercel.json
  // and the public map breaks with nothing but a console line to say why.
  const headers = JSON.parse(read('../vercel.json')).headers.flatMap((rule) => rule.headers);
  const csp = headers.find((header) => header.key === 'Content-Security-Policy').value;
  const directive = (name) => (csp.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name} `)) || '');
  assert.ok(directive('img-src').includes('https://tile.openstreetmap.org'), 'map tiles');
  assert.ok(directive('connect-src').includes('https://nominatim.openstreetmap.org'), 'address lookups');
  const permissions = headers.find((header) => header.key === 'Permissions-Policy').value;
  assert.ok(permissions.includes('geolocation=(self)'), 'Use my location');
});

test('a rejected submission leaves the form exactly as it was typed', () => {
  // The page redraws from innerHTML, so redrawing on "sending" or on an error rebuilt every box
  // empty -- a pinned location included. Only a success redraws now.
  const submit = pageSource.slice(pageSource.indexOf('async function submit('), pageSource.indexOf('/** One delegated listener'));
  assert.ok(!submit.includes('setState({ busy: true'), 'no redraw while sending');
  assert.ok(!submit.includes('setState({ busy: false, error'), 'no redraw on an error');
  assert.ok(submit.includes('paintSending(root, false, error.message)'), 'the error is painted in place');
  assert.ok(submit.includes('setState({ busy: false, done: true })'), 'a success still moves on to thank you');
});

test('the map styles, Leaflet included, arrive with the map and not with every form', () => {
  const formSheet = read('../src/intake/public-page.css');
  const mapSheet = read('../src/intake/map-picker.css');
  assert.ok(!formSheet.includes('.intake-map-overlay'), 'the dialog is not styled by the form sheet');
  assert.ok(formSheet.includes('button.intake-pin {'), 'the pin is, because it shows before the map opens');
  assert.ok(mapSheet.includes("@import 'leaflet/dist/leaflet.css';"), 'Leaflet\'s sheet comes with the dialog\'s');
  assert.ok(pickerSource.includes("import('./map-picker.css')"));
});
