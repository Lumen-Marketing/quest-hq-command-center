// Tabler -> Lucide name map for the icons this app uses.
//
// 58% of the app's icon names exist in Lucide verbatim and need no entry here. The rest
// are named differently by the two projects — Tabler says `device-desktop`, Lucide says
// `monitor` — and this is that translation.
//
// Anything NOT listed here, and not a direct name match, keeps its Tabler glyph. A handful
// of mixed icons is much better than a confidently wrong one: `ladder` has no Lucide
// equivalent, and picking something ladder-ish would mislabel a control.
//
// Every target is validated against Lucide's own codepoints at build time, so a typo or a
// glyph renamed upstream fails the build rather than silently rendering a blank box.
//
// `-filled` variants map to the plain Lucide glyph: Lucide is a single-weight outline set
// and has no filled forms.

export const LUCIDE_ALIASES = {
  // people and identity
  'address-book': 'contact',
  id: 'id-card',
  'id-badge': 'id-card',
  'id-badge-2': 'id-card',
  'users-group': 'users',
  'users-plus': 'user-plus',
  'user-question': 'user-search',

  // buildings and places
  'building-bank': 'landmark',
  'building-community': 'building-2',
  'building-factory': 'factory',
  'building-hospital': 'hospital',
  'building-skyscraper': 'building-2',
  'building-store': 'store',
  'building-warehouse': 'warehouse',
  'car-garage': 'car',
  'home-2': 'house',
  world: 'globe',
  'world-plus': 'globe',
  'world-upload': 'globe',
  'world-www': 'globe',
  'current-location': 'locate-fixed',

  // trades and site
  bulldozer: 'tractor',
  crane: 'construction',
  helmet: 'hard-hat',
  'ruler-measure': 'ruler',
  'settings-automation': 'settings-2',
  tool: 'wrench',
  tools: 'wrench',
  'tools-kitchen-2': 'utensils',
  wall: 'brick-wall',
  tree: 'trees',
  plant: 'sprout',
  'sun-electricity': 'sun',
  'plug-connected': 'plug-zap',
  'first-aid-kit': 'briefcase-medical',
  flask: 'flask-conical',

  // transport
  'truck-delivery': 'truck',
  'truck-loading': 'truck',

  // documents
  certificate: 'award',
  'file-certificate': 'file-badge',
  'file-description': 'file-text',
  'file-dollar': 'file-text',
  'file-export': 'file-output',
  'file-import': 'file-input',
  'file-invoice': 'receipt-text',
  'file-pencil': 'file-pen',
  'file-type-pdf': 'file-text',
  'file-zip': 'file-archive',
  'folder-share': 'folder-symlink',
  books: 'library',
  note: 'sticky-note',
  notes: 'notebook',
  report: 'file-text',
  'report-analytics': 'chart-column',
  template: 'layout-template',
  forms: 'clipboard-list',
  'clipboard-data': 'clipboard-list',
  'clipboard-text': 'clipboard-list',
  checklist: 'list-checks',
  'list-details': 'list',
  versions: 'layers',

  // money
  cash: 'banknote',
  coin: 'circle-dollar-sign',
  'coin-filled': 'circle-dollar-sign',
  'currency-dollar': 'dollar-sign',
  'receipt-2': 'receipt',
  'receipt-dollar': 'receipt',
  'calendar-dollar': 'calendar',

  // calendar and time
  'calendar-event': 'calendar-days',
  'calendar-stats': 'calendar-range',
  'calendar-up': 'calendar-arrow-up',
  'clock-hour-4': 'clock',
  alarm: 'alarm-clock',

  // messaging
  message: 'message-square',
  'message-2': 'message-square',
  'message-filled': 'message-square',
  'message-plus': 'message-square-plus',
  messages: 'messages-square',
  microphone: 'mic',
  speakerphone: 'megaphone',
  at: 'at-sign',

  // devices
  'device-desktop': 'monitor',
  'device-floppy': 'save',
  'device-laptop': 'laptop',
  'device-mobile': 'smartphone',
  'device-mobile-filled': 'smartphone',
  robot: 'bot',
  qrcode: 'qr-code',

  // media
  photo: 'image',
  'photo-check': 'image',
  'photo-edit': 'image',
  'photo-filled': 'image',
  'photo-up': 'image-up',
  paint: 'paintbrush',
  'paint-filled': 'paintbrush',
  highlight: 'highlighter',
  ballpen: 'pen-line',
  'pencil-plus': 'pencil',
  'player-play-filled': 'play',
  'player-stop-filled': 'square',

  // layout and navigation
  apps: 'layout-grid',
  'layout-board-split': 'columns-2',
  'layout-cards': 'layout-grid',
  'layout-grid-add': 'layout-grid',
  'layout-kanban': 'kanban',
  'window-maximize': 'maximize',
  'arrows-minimize': 'minimize-2',
  'arrows-sort': 'arrow-up-down',
  'arrow-back-up': 'undo-2',
  'arrow-forward-up': 'redo-2',
  'arrow-move-right': 'move-right',
  'arrow-down-to-arc': 'download',
  'caret-down-filled': 'chevron-down',
  'caret-up-filled': 'chevron-up',
  selector: 'chevrons-up-down',
  select: 'square-mouse-pointer',
  dots: 'ellipsis',
  point: 'dot',
  line: 'minus',
  login: 'log-in',
  logout: 'log-out',
  click: 'mouse-pointer-click',

  // state and controls
  adjustments: 'sliders-horizontal',
  'adjustments-filled': 'sliders-horizontal',
  'adjustments-horizontal': 'sliders-horizontal',
  checkbox: 'square-check',
  checks: 'check-check',
  'filter-off': 'filter-x',
  'filter-search': 'filter',
  'info-circle': 'info',
  'eye-check': 'eye',
  refresh: 'refresh-cw',
  restore: 'history',
  rotate: 'rotate-cw',
  'trash-x': 'trash-2',
  progress: 'loader',
  'shield-lock': 'shield-check',
  'rosette-discount-check': 'badge-check',
  badges: 'badge',
  bulb: 'lightbulb',
  'bulb-filled': 'lightbulb',
  automation: 'workflow',
  'hierarchy-3': 'network',
  heartbeat: 'activity',
  'hand-stop': 'hand',
  basket: 'shopping-basket',
  cup: 'coffee',
  paw: 'paw-print',
  packages: 'boxes',
  'package-import': 'package-open',
  'database-export': 'database-backup',
  'database-off': 'database',
  sum: 'sigma',
  'math-function': 'square-function',
  'letter-case': 'case-sensitive',
  'letter-t': 'type',
  'number-9': 'hash',
  ladder: '',
  // The spreadsheet ribbon. Lucide's `between-*` icons are literally "insert between", which
  // is exactly what the Insert menu does.
  'border-all': 'grid-3x3',
  'border-none': 'square-dashed',
  'layout-align-top': 'align-vertical-justify-start',
  'layout-align-middle': 'align-vertical-justify-center',
  'layout-align-bottom': 'align-vertical-justify-end',
  'letter-case-upper': 'case-upper',
  'letter-case-lower': 'case-lower',
  'letter-a': 'type',
  'arrow-autofit-width': 'table-cells-merge',
  'table-plus': 'grid-2x2-plus',
  'table-minus': 'grid-2x2-x',
  'row-insert-top': 'between-vertical-start',
  'row-insert-bottom': 'between-vertical-end',
  'column-insert-left': 'between-horizontal-start',
  'column-insert-right': 'between-horizontal-end',
  'arrows-horizontal': 'move-horizontal',
  'arrows-vertical': 'move-vertical',
  'ruler-measure': 'ruler',
  paint: 'paint-bucket',
  // A plain `rows-2` for "delete rows" says rows, not delete. Tabler's own is clearer.
  'row-remove': '',
  'column-remove': '',
  decimal: '',
};

/** Aliases with an empty target are explicit "no good Lucide equivalent" — keep Tabler. */
export const NO_LUCIDE_EQUIVALENT = Object.entries(LUCIDE_ALIASES)
  .filter(([, target]) => !target)
  .map(([name]) => name);
