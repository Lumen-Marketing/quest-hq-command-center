export const SETUP_TABS = Object.freeze([
  { id: 'company-profile', label: 'Company Profile' },
  { id: 'company-brand', label: 'Company Brand' },
  { id: 'workspaces', label: 'Workspaces' },
  { id: 'modules', label: 'Modules' },
  { id: 'pipelines', label: 'Pipelines' },
  { id: 'handoffs', label: 'Handoffs' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'launch-check', label: 'Launch Check' },
]);

export const PEOPLE_ACCESS_TABS = Object.freeze([
  { id: 'members', label: 'Members' },
  { id: 'roles', label: 'Roles' },
  { id: 'access', label: 'Access' },
  { id: 'invites', label: 'Invites' },
]);

export const ADMIN_TABS = Object.freeze([
  { id: 'billing', label: 'Billing', permissions: ['billing.view'] },
  { id: 'data-recovery', label: 'Data & Recovery', permissions: ['settings.manage'] },
  { id: 'audit-history', label: 'Audit History', permissions: ['users.manage', 'settings.manage'] },
  { id: 'diagnostics', label: 'Diagnostics', permissions: ['settings.manage'] },
  { id: 'platform', label: 'Platform', developerOnly: true },
]);

const LEGACY_SETTINGS_DESTINATIONS = Object.freeze({
  company: { section: 'setup', tab: 'company-profile' },
  setup: { section: 'setup', tab: 'workspaces' },
  plugins: { section: 'setup', tab: 'modules' },
  'handoff-review': { section: 'setup', tab: 'handoffs' },
  roles: { section: 'users', tab: 'roles' },
  access: { section: 'users', tab: 'access' },
  team: { section: 'users', tab: 'members' },
  billing: { section: 'admin', tab: 'billing' },
  backups: { section: 'admin', tab: 'data-recovery' },
  'recycle-bin': { section: 'admin', tab: 'data-recovery' },
  master: { section: 'admin', tab: 'platform' },
});

export function canonicalSettingsDestination(tab = 'company') {
  return LEGACY_SETTINGS_DESTINATIONS[String(tab || 'company')]
    || LEGACY_SETTINGS_DESTINATIONS.company;
}

export function settingsSurfaceTabs(surface, { isDeveloper = false, can = () => false } = {}) {
  if (surface === 'setup') return SETUP_TABS;
  if (surface === 'people') return PEOPLE_ACCESS_TABS;
  if (surface === 'admin') {
    if (isDeveloper) return ADMIN_TABS;
    return ADMIN_TABS.filter((tab) => !tab.developerOnly
      && (tab.permissions || []).some((permission) => can(permission)));
  }
  return [];
}

export function normalizeSettingsSurfaceTab(surface, requestedTab, capabilities = {}) {
  const tabs = settingsSurfaceTabs(surface, capabilities);
  const requested = String(requestedTab || '');
  return tabs.some((tab) => tab.id === requested) ? requested : (tabs[0]?.id || '');
}

export function renderSettingsSurfaceLoadError({ h, message = '' }) {
  return `
    <article class="panel span-3 settings-load-error" role="alert">
      <div class="section-head">
        <div>
          <h2>Settings could not load</h2>
          <p>${h(message || 'The settings files were unavailable. Check your connection and try again.')}</p>
        </div>
        <button class="btn btn-primary" type="button" data-action="retry-settings-surfaces">Try again</button>
      </div>
    </article>
  `;
}
