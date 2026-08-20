function markReadOnly(control) {
  if (!control) return;
  control.setAttribute?.('data-readonly-disabled', 'true');
  control.setAttribute?.('aria-disabled', 'true');
  if (control.matches?.('button, input, select, textarea, option, fieldset')) control.disabled = true;
  if (!control.getAttribute?.('title')) control.setAttribute?.('title', 'Unavailable in the read-only sample workspace');
}

/**
 * Reflect the existing read-only action/form guards in the rendered controls.
 *
 * The click and submit guards remain the security backstop. This pass prevents
 * the interface from advertising writes that it will reject only after the
 * person has filled a form or pressed a button.
 */
export function applyReadOnlyControlState(root, {
  readOnly,
  isMutableAction,
  isMutableFormSubmit,
} = {}) {
  if (!readOnly || !root?.querySelectorAll) return;

  for (const control of root.querySelectorAll('[data-action]')) {
    if (isMutableAction?.(control.dataset?.action || '')) markReadOnly(control);
  }

  for (const form of root.querySelectorAll('form')) {
    if (!isMutableFormSubmit?.(form)) continue;
    for (const control of form.querySelectorAll('button, input, select, textarea, option, fieldset')) {
      const action = control.dataset?.action || '';
      if (action && !isMutableAction?.(action)) continue;
      markReadOnly(control);
    }
  }

  // The underwriter save control lives in the top bar and targets its form by
  // id, so it is not returned by form.querySelectorAll(). Cover every external
  // submit control using the browser's resolved target form.
  for (const control of root.querySelectorAll('[type="submit"][form]')) {
    const formId = control.getAttribute?.('form') || '';
    const form = root.ownerDocument?.getElementById?.(formId);
    if (isMutableFormSubmit?.(form)) markReadOnly(control);
  }

  // Upload controls often live inside a label rather than a named form. Every
  // file choice ultimately writes storage or local workspace state, so none is
  // meaningful in the sample company.
  for (const input of root.querySelectorAll('input[type="file"]')) {
    markReadOnly(input);
    markReadOnly(input.closest?.('label'));
  }
}
