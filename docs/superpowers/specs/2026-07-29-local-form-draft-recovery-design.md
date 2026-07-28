# Local Form Draft Recovery

**Date:** 2026-07-29
**Status:** Approved direction; awaiting written-spec review

## Goal

Protect high-value Questbase work from accidental loss when a user refreshes,
closes a modal, navigates away, or the browser crashes. The first release
covers Contacts, Jobs, Quotes, and Underwriter because these forms contain the
largest amount of business input and already have clear, confirmed save paths.

Drafts are recovery copies, not real records. They remain on the current
browser and are never sent to Supabase until the user performs the existing
Save action.

## Approaches considered

1. **Local browser drafts - selected.** Fast to ship, works during network
   trouble, needs no migration, and cannot create incomplete production rows.
2. **Automatic live-record saves.** Rejected for this release because partial
   forms could become real contacts, jobs, quotes, or underwriting decisions
   and could trigger existing automations.
3. **Database-backed drafts.** Deferred because cross-device recovery requires
   new tables, RLS, cleanup rules, conflict behavior, and a larger release
   surface than can be verified safely today.

## User experience

Each protected form shows a small draft status near its heading:

- `Saving draft...` while a local write is queued.
- `Draft saved locally - <time>` after the write succeeds.
- `Local draft unavailable` if browser storage cannot be used. The form
  remains usable and the existing real Save action is unaffected.

When a matching unfinished draft exists, Questbase shows a recovery notice in
the form with:

- **Restore draft** to apply the saved values.
- **Discard** to delete the recovery copy and keep the current form values.

Questbase does not silently replace current database values. Cancelling or
closing a form keeps the recovery copy. A confirmed successful real save or
an explicit Discard removes it. Validation failures and server failures keep
the draft.

For Underwriter, the draft key follows the selected contact. Switching
contacts first flushes the current contact's pending local draft, then checks
for a draft belonging to the newly selected contact.

## Draft identity and lifetime

One shared draft engine builds a key from:

- signed-in profile id;
- company id;
- active workspace id;
- form type (`contact`, `job`, `quote`, or `underwriter`);
- record id, or `new` for a create form.

This prevents one user, company, workspace, form, or existing record from
restoring another context's values. Drafts use the versioned prefix
`questbase.form-draft.v1` and expire seven days after their most recent edit.
Expired and malformed entries are ignored and removed during normal draft
reads.

Explicit sign-out removes the signing-out user's Questbase form drafts from
that browser. Clearing browser data can also remove drafts; the interface
describes them as local rather than cloud-saved.

## Architecture

Add a focused module under `src/drafts/form-drafts.js`. It owns:

- versioned key generation;
- safe form-value serialization;
- local storage reads, writes, removal, and expiry;
- debounced scheduling and final synchronous flush;
- value restoration;
- storage-error results that callers can display without throwing.

The serialized record contains only its schema version, update time, and form
values. Serialization supports text fields, textareas, selects, checkboxes,
and radio controls. It excludes:

- password fields;
- file inputs and file contents;
- buttons;
- elements marked `data-draft-ignore`;
- auth tokens, invite tokens, or service credentials.

The browser app integrates the module through one delegated input/change path
rather than four unrelated listeners. Protected forms declare their type and
record identity through data attributes. The existing render paths attach the
recovery notice and status, while the existing save functions clear drafts
only after their live or allowed local save path reports success.

Restoring Underwriter values also runs its existing calculator synchronization
so the decision summary immediately matches the recovered inputs.

## Failure and conflict behavior

- Storage quota, disabled storage, or a corrupt entry never blocks editing or
  the existing Save button.
- The latest local edit replaces the previous local draft for the same key.
- Any matching, non-expired draft created by a prior edit is offered for
  recovery; it is never auto-applied.
- A successful real save always wins and removes the matching local draft.
- A failed real save preserves the draft and shows the existing save error.
- This release does not synchronize drafts across tabs or devices.

## Testing

Unit tests cover:

- key isolation across users, companies, workspaces, form types, and records;
- text, select, checkbox, and radio serialization/restoration;
- password, file, ignored-field, and token exclusion;
- expiry and malformed-record cleanup;
- unavailable/quota-limited storage behavior;
- successful clear and failed-save preservation;
- debounced write plus final flush.

Integration/static tests confirm:

- all four target forms opt into the shared engine;
- Contacts, Jobs, Quotes, and Underwriter clear only after confirmed success;
- Underwriter restoration recalculates the decision summary;
- sign-out purges only the signing-out user's draft namespace.

Production verification uses one non-sensitive test record per workflow:

1. enter values without saving;
2. refresh, close, or navigate away;
3. reopen and restore the draft;
4. save the real record;
5. reopen and confirm that no stale draft is offered.

## Success criteria

- Unfinished work in all four target workflows survives refresh, accidental
  closing, navigation, and browser restart on the same device.
- Draft recovery never creates or mutates a Supabase row by itself.
- Tenant, workspace, user, form, and record boundaries are preserved.
- Failed real saves retain recoverable input.
- Successful real saves do not leave stale recovery prompts.
- Existing production checks, bundle budget, and all four real save flows pass.

## Non-goals

- Cross-device drafts.
- Collaborative draft editing.
- Draft attachments or uploaded file contents.
- Automatic creation of incomplete database records.
- Coverage of every Questbase form in the first release.
