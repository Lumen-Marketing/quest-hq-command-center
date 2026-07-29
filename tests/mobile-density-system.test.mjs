import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import postcss from 'postcss';

const hostCss = postcss.parse(
  readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8'),
);
const taskCss = postcss.parse(
  readFileSync(new URL('../taskmanagement/css/mobile.css', import.meta.url), 'utf8'),
);

function mediaApplies(params, width) {
  const max = params.match(/max-width:\s*(\d+)px/i);
  const min = params.match(/min-width:\s*(\d+)px/i);
  return (!max || width <= Number(max[1])) && (!min || width >= Number(min[1]));
}

function declarationsAt(root, selector, width = 390) {
  const declarations = {};

  root.walkRules((rule) => {
    let ancestor = rule.parent;
    let applies = true;

    while (ancestor && ancestor.type !== 'root') {
      if (
        ancestor.type === 'atrule'
        && ancestor.name === 'media'
        && !mediaApplies(ancestor.params, width)
      ) {
        applies = false;
        break;
      }
      ancestor = ancestor.parent;
    }

    if (!applies || !rule.selectors?.includes(selector)) return;
    rule.walkDecls((declaration) => {
      declarations[declaration.prop] = declaration.value;
    });
  });

  return declarations;
}

test('390px shell gives content the remaining viewport instead of preserving desktop chrome', () => {
  assert.deepEqual(
    {
      minHeight: declarationsAt(hostCss, '.topbar')['min-height'],
      padding: declarationsAt(hostCss, '.topbar').padding,
    },
    { minHeight: '52px', padding: '6px 10px' },
  );
  assert.deepEqual(
    {
      maxHeight: declarationsAt(hostCss, '.mobile-status-rail')['max-height'],
      padding: declarationsAt(hostCss, '.mobile-status-rail').padding,
    },
    { maxHeight: '42px', padding: '4px 10px' },
  );
  assert.deepEqual(
    {
      height: declarationsAt(hostCss, '.work-surface').height,
      minHeight: declarationsAt(hostCss, '.work-surface')['min-height'],
      padding: declarationsAt(hostCss, '.work-surface').padding,
    },
    {
      height: 'auto',
      minHeight: '0',
      padding: '12px 10px calc(64px + env(safe-area-inset-bottom, 0px))',
    },
  );
  assert.equal(declarationsAt(hostCss, '.mobile-tabbar a')['min-height'], '50px');
});

test('an open message thread uses the available mobile row and keeps a compact composer', () => {
  assert.equal(
    declarationsAt(hostCss, '.messages-page.thread-open .message-command-bar').display,
    'none',
  );
  assert.deepEqual(
    {
      height: declarationsAt(hostCss, '.message-simple-page').height,
      minHeight: declarationsAt(hostCss, '.message-simple-page')['min-height'],
      gap: declarationsAt(hostCss, '.message-simple-page').gap,
    },
    { height: '100%', minHeight: '0', gap: '10px' },
  );
  assert.deepEqual(
    {
      height: declarationsAt(hostCss, '.message-simple-main').height,
      rows: declarationsAt(hostCss, '.message-simple-main')['grid-template-rows'],
    },
    { height: '100%', rows: 'auto minmax(0, 1fr) auto' },
  );
  assert.equal(
    declarationsAt(hostCss, '.message-simple-main .thread-head').padding,
    '6px 8px',
  );
  assert.deepEqual(
    {
      columns: declarationsAt(hostCss, '.message-simple-main .message-composer')[
        'grid-template-columns'
      ],
      padding: declarationsAt(hostCss, '.message-simple-main .message-composer').padding,
    },
    {
      columns: '40px minmax(0, 1fr) 40px',
      padding: '6px 8px calc(6px + env(safe-area-inset-bottom, 0px))',
    },
  );
});

test('mobile dashboard uses scrollable controls and two-column compact metrics', () => {
  assert.deepEqual(
    {
      wrap: declarationsAt(hostCss, '.dash-role-tabs')['flex-wrap'],
      overflow: declarationsAt(hostCss, '.dash-role-tabs')['overflow-x'],
    },
    { wrap: 'nowrap', overflow: 'auto' },
  );
  assert.deepEqual(
    {
      wrap: declarationsAt(hostCss, '.dash-range-seg')['flex-wrap'],
      overflow: declarationsAt(hostCss, '.dash-range-seg')['overflow-x'],
    },
    { wrap: 'nowrap', overflow: 'auto' },
  );
  assert.equal(
    declarationsAt(hostCss, '.dash-widget-kpis')['grid-template-columns'],
    'repeat(2, minmax(0, 1fr))',
  );
  assert.equal(declarationsAt(hostCss, '.dash-widget-card').padding, '12px');
  assert.deepEqual(
    {
      gap: declarationsAt(hostCss, '.dash-kpi').gap,
      padding: declarationsAt(hostCss, '.dash-kpi').padding,
    },
    { gap: '8px', padding: '10px' },
  );
  assert.equal(
    declarationsAt(hostCss, '.dash-filter-field')['grid-template-columns'],
    '48px minmax(0, 1fr)',
  );
});

test('mobile pipelines keep stages on one line and make job cards wider but denser', () => {
  assert.deepEqual(
    {
      wrap: declarationsAt(hostCss, '.pipe-chips')['flex-wrap'],
      overflow: declarationsAt(hostCss, '.pipe-chips')['overflow-x'],
    },
    { wrap: 'nowrap', overflow: 'auto' },
  );
  assert.equal(
    declarationsAt(hostCss, '.pipe-board')['grid-auto-columns'],
    'min(82vw, 300px)',
  );
  assert.deepEqual(
    {
      gap: declarationsAt(hostCss, '.job-card').gap,
      padding: declarationsAt(hostCss, '.job-card').padding,
    },
    { gap: '4px', padding: '10px' },
  );
  assert.equal(declarationsAt(hostCss, '.job-card strong')['font-size'], '14px');
});

test('embedded Tasks spends less mobile height on header chrome and row padding', () => {
  assert.equal(
    declarationsAt(taskCss, 'body.ui-command-center .page-head', 366).padding,
    '10px var(--m-gap) 6px',
  );
  assert.deepEqual(
    {
      gap: declarationsAt(taskCss, 'body.ui-command-center .head-card', 366).gap,
      padding: declarationsAt(taskCss, 'body.ui-command-center .head-card', 366).padding,
    },
    { gap: '6px', padding: '6px 8px' },
  );
  assert.equal(
    declarationsAt(taskCss, 'body.ui-command-center .page-head-widgets', 366)['row-gap'],
    '8px',
  );
  assert.equal(
    declarationsAt(
      taskCss,
      'body.ui-command-center .page-head-widgets > * > .up-next-card',
      366,
    ).padding,
    '8px 10px',
  );
  assert.equal(
    declarationsAt(taskCss, '#taskViewWrap.qt-skin .qt-ghead', 366).padding,
    '8px 12px',
  );
  assert.equal(
    declarationsAt(taskCss, '#taskViewWrap.qt-skin .qt-row', 366).padding,
    '6px 10px',
  );
});
