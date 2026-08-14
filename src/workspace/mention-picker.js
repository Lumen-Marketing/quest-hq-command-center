// The @-mention picker on a comment box.
//
// Fetched when a page actually has one. Most pages do not: it is the record card and the
// workspace feed, and neither is on screen for a session that never opens either.

export function createMentionPicker(ctx) {
  const { h, wbAvatar, wbMembers } = ctx;

  function wbBindMentionPickers(root, companyId) {
    (root || document).querySelectorAll('[data-wb-mention]').forEach((input) => {
      if (input.dataset.mentionBound) return;
      input.dataset.mentionBound = '1';
      const wrap = input.closest('[data-wb-mention-wrap]');
      const results = wrap?.querySelector('[data-wb-mention-results]');
      if (!results) return;
  
      let matches = [];
      let active = 0;
      let at = -1;
  
      const close = () => { results.hidden = true; results.innerHTML = ''; matches = []; at = -1; };
  
      const paint = () => {
        results.innerHTML = matches.map((m, i) => `<button type="button" class="wb-mention-result${i === active ? ' active' : ''}" role="option" aria-selected="${i === active}" data-i="${i}">`
          + `${wbAvatar({ id: m.id, name: m.name, color: m.color, avatar_url: m.avatar_url }, 22)}<span>${h(m.name)}</span></button>`).join('');
        results.hidden = !matches.length;
      };
  
      const commit = (member) => {
        if (!member || at < 0) return;
        const before = input.value.slice(0, at);
        const after = input.value.slice(input.selectionStart ?? input.value.length);
        // A trailing space so the next word is not swallowed into the mention.
        input.value = `${before}@${member.name} ${after}`;
        const caret = before.length + member.name.length + 2;
        input.setSelectionRange(caret, caret);
        close();
        input.focus();
      };
  
      const refresh = () => {
        const caret = input.selectionStart ?? input.value.length;
        // The @-run the caret sits in: @ at a word boundary, then anything but @ or newline.
        const found = /(^|\s)@([^@\n]*)$/.exec(input.value.slice(0, caret));
        if (!found) { close(); return; }
        at = caret - found[2].length - 1;
        const query = found[2].trim().toLowerCase();
        matches = wbMembers(companyId)
          .filter((m) => m.name && (!query || m.name.toLowerCase().includes(query)))
          .slice(0, 6);
        active = 0;
        paint();
      };
  
      input.addEventListener('input', refresh);
      input.addEventListener('click', refresh);
      input.addEventListener('keydown', (event) => {
        if (results.hidden || !matches.length) return;
        if (event.key === 'ArrowDown') { event.preventDefault(); active = (active + 1) % matches.length; paint(); return; }
        if (event.key === 'ArrowUp') { event.preventDefault(); active = (active - 1 + matches.length) % matches.length; paint(); return; }
        // Enter picks the highlighted member rather than sending a half-typed name. The flag
        // is what tells the send handler to stand down: both listeners are on this same
        // element, so stopPropagation does not reach it, and by the time it runs commit() has
        // already closed the list -- so "is the list open" would answer no and send anyway.
        if (event.key === 'Enter' || event.key === 'Tab') {
          event.preventDefault();
          event.mentionHandled = true;
          commit(matches[active]);
          return;
        }
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      });
      // mousedown, not click: the input's own blur would close the list first.
      results.addEventListener('mousedown', (event) => {
        const button = event.target.closest('[data-i]');
        if (!button) return;
        event.preventDefault();
        commit(matches[Number(button.dataset.i)]);
      });
      input.addEventListener('blur', () => { setTimeout(close, 120); });
    });
  }

  return { wbBindMentionPickers };
}
