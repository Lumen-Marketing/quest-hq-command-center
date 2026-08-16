// The icon a workspace or an app is drawn with.
//
// Kept out of the entry bundle deliberately: a hundred-odd Tabler class names is a list
// nobody sees until they open the icon picker, and it was costing every first paint. The two
// defaults stay in main.js as literals, because normalising a stored document has to name a
// fallback icon before anything is fetched.
//
// Names are permanent. They are stored on workspace and app rows, so removing one silently
// resets every record using it back to the default.

export const WB_WS_ICONS = ['ti-rocket', 'ti-speakerphone', 'ti-tools', 'ti-headset', 'ti-home-2', 'ti-building-store', 'ti-hammer', 'ti-users-group', 'ti-chart-bar', 'ti-cash', 'ti-package', 'ti-palette'];

export const WB_APP_ICONS = [
  'ti-address-book', 'ti-checklist', 'ti-folder', 'ti-calendar-event', 'ti-receipt', 'ti-bug',
  'ti-shopping-cart', 'ti-id-badge', 'ti-truck', 'ti-file-description', 'ti-phone', 'ti-flask',
  'ti-briefcase', 'ti-building', 'ti-building-store', 'ti-building-factory', 'ti-home', 'ti-users',
  'ti-user', 'ti-users-group', 'ti-mail', 'ti-message', 'ti-message-circle', 'ti-clipboard-list',
  'ti-clipboard-check', 'ti-notes', 'ti-note', 'ti-book', 'ti-bookmark', 'ti-tag', 'ti-tags',
  'ti-star', 'ti-heart', 'ti-flag', 'ti-map-pin', 'ti-map', 'ti-world', 'ti-package', 'ti-box',
  'ti-packages', 'ti-gift', 'ti-credit-card', 'ti-cash', 'ti-coin', 'ti-wallet', 'ti-chart-bar',
  'ti-chart-line', 'ti-chart-pie', 'ti-report', 'ti-file', 'ti-file-text', 'ti-files', 'ti-photo',
  'ti-camera', 'ti-video', 'ti-music', 'ti-headphones', 'ti-microphone', 'ti-bell', 'ti-alarm',
  'ti-clock', 'ti-calendar', 'ti-calendar-stats', 'ti-settings', 'ti-tool', 'ti-tools', 'ti-adjustments',
  'ti-hammer', 'ti-rocket', 'ti-plane', 'ti-car', 'ti-bike', 'ti-ship', 'ti-leaf', 'ti-plant',
  'ti-tree', 'ti-paw', 'ti-heartbeat', 'ti-stethoscope', 'ti-pill', 'ti-first-aid-kit', 'ti-shield',
  'ti-lock', 'ti-key', 'ti-cloud', 'ti-database', 'ti-server', 'ti-device-laptop',
  'ti-device-desktop', 'ti-device-mobile', 'ti-printer', 'ti-cpu', 'ti-code', 'ti-terminal',
  'ti-bulb', 'ti-atom', 'ti-microscope', 'ti-school', 'ti-certificate', 'ti-award', 'ti-trophy',
  'ti-target', 'ti-compass', 'ti-anchor', 'ti-brush', 'ti-palette', 'ti-pencil', 'ti-scissors',
  'ti-ruler', 'ti-calculator', 'ti-coffee', 'ti-cup', 'ti-ticket', 'ti-basket', 'ti-shopping-bag',
];

// Icons a Button field wants and an app icon rarely does: the arrows that say "this moves on",
// a bin for a button that clears, a floppy for one that saves. Kept in one list with the rest
// so the picker stays a single grid, and every name here is checked against the bundled font
// by the button tests -- there is no CDN, so a wrong name is a blank square.
export const WB_ACTION_ICONS = [
  // Movement and direction.
  'ti-arrow-right', 'ti-arrow-left', 'ti-arrow-up', 'ti-arrow-down',
  'ti-arrow-back-up', 'ti-arrow-forward-up', 'ti-arrows-sort', 'ti-refresh',
  'ti-chevron-right', 'ti-chevron-left', 'ti-chevron-up', 'ti-chevron-down',
  // Doing something with it.
  'ti-send', 'ti-share', 'ti-external-link', 'ti-click',
  'ti-trash', 'ti-trash-x', 'ti-eraser', 'ti-x',
  'ti-device-floppy', 'ti-check', 'ti-circle-check', 'ti-player-play',
  'ti-plus', 'ti-edit', 'ti-pencil', 'ti-search', 'ti-download',
  // Getting hold of somebody. A button that calls or emails wants one of these.
  'ti-mail', 'ti-message', 'ti-phone', 'ti-bell',
  // People.
  'ti-user', 'ti-users', 'ti-user-plus', 'ti-user-circle',
  // Getting around.
  'ti-home', 'ti-menu-2', 'ti-settings',
  // Money. A button that quotes, invoices, takes a payment or files a receipt is the
  // commonest thing anybody builds here, and none of it had an icon that said so.
  'ti-cash', 'ti-cash-banknote', 'ti-coin', 'ti-coins',
  'ti-credit-card', 'ti-wallet', 'ti-building-bank', 'ti-pig-money', 'ti-receipt',
  'ti-currency-dollar', 'ti-currency-euro', 'ti-currency-pound',
  'ti-currency-peso', 'ti-currency-bitcoin',
  'ti-calculator', 'ti-chart-bar', 'ti-chart-line', 'ti-businessplan',
  // Somewhere else entirely.
  'ti-brand-github', 'ti-brand-google', 'ti-brand-facebook',
  'ti-brand-twitter', 'ti-brand-apple',
];
