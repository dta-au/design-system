/**
 * @file
 * Table Sort — framework-agnostic progressive enhancement.
 *
 * Finds all tables with the class `ct-table--sortable` and progressively
 * enhances them with MOJ-style sortable column header buttons.
 *
 * Usage: apply the class `ct-table--sortable` to any <table> element. The
 * behavior attaches automatically via DOMContentLoaded (static/Storybook) or
 * Drupal.behaviors (Drupal). Stories call window.DgaTableSort.initAll().
 *
 * Pre-sorted columns: add aria-sort="ascending|descending" directly to the
 * <th>, or add the class `ct-sort--asc` / `ct-sort--desc`.
 *
 * Custom sort values: add data-sort-value="..." to any <td> to override what
 * value is used for sorting (e.g. a numeric timestamp for a date cell).
 */

/* global Drupal */

(function () {
  'use strict';

  // SVG arrow icons — MOJ Design System pattern.
  // focusable="false" + aria-hidden="true" hides icons from assistive tech.
  // fill="currentColor" ensures visibility in Windows High Contrast Mode.
  const SVG_UP = '<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5625 15.5L11 6.63125L15.4375 15.5H6.5625Z" fill="currentColor"/></svg>';
  const SVG_DOWN = '<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.4375 7L11 15.8687L6.5625 7L15.4375 7Z" fill="currentColor"/></svg>';
  const SVG_UPDOWN = '<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.1875 9.5L10.9609 3.95703L13.7344 9.5H8.1875Z" fill="currentColor"/><path d="M13.7344 12.0781L10.9609 17.6211L8.1875 12.0781H13.7344Z" fill="currentColor"/></svg>';

  // ---------------------------------------------------------------------------
  // Helpers.
  // ---------------------------------------------------------------------------

  function getCellValue(cell) {
    if (!cell) return '';
    const raw = cell.getAttribute('data-sort-value') || cell.textContent.trim();
    const num = Number(raw);
    return Number.isFinite(num) ? num : raw;
  }

  function updateIcons(headings) {
    headings.forEach((th) => {
      const btn = th.querySelector('.ct-sort-btn');
      if (!btn) return;

      const existing = btn.querySelector('svg');
      if (existing) existing.remove();

      const dir = th.getAttribute('aria-sort');
      btn.insertAdjacentHTML('beforeend',
        dir === 'ascending' ? SVG_UP :
        dir === 'descending' ? SVG_DOWN :
        SVG_UPDOWN
      );
    });
  }

  function sortRows(tbody, colIndex, direction) {
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const ascending = direction === 'ascending';

    rows.sort((a, b) => {
      const aCell = a.querySelectorAll('td, th')[colIndex];
      const bCell = b.querySelectorAll('td, th')[colIndex];
      const aVal = getCellValue(aCell);
      const bVal = getCellValue(bCell);

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return ascending ? aVal - bVal : bVal - aVal;
      }
      return ascending
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    rows.forEach((row) => tbody.appendChild(row));
  }

  function initialiseSortedColumn(headings, tbody) {
    headings.forEach((th) => {
      const dir = th.getAttribute('aria-sort');
      if (dir !== 'ascending' && dir !== 'descending') return;
      const btn = th.querySelector('.ct-sort-btn');
      if (!btn) return;
      sortRows(tbody, parseInt(btn.getAttribute('data-index'), 10), dir);
    });
  }

  // ---------------------------------------------------------------------------
  // Core enhancement — no Drupal dependency.
  // ---------------------------------------------------------------------------

  function initTable(table) {
    // Idempotency guard — replaces once().
    if (table.dataset.tableSortInit) return;
    table.dataset.tableSortInit = 'true';

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    if (!thead || !tbody) return;

    const headings = Array.from(thead.querySelectorAll('th'));

    // Resolve initial aria-sort state for every heading.
    // Priority: existing aria-sort attribute > ct-sort--* class > 'none'.
    headings.forEach((th) => {
      const preset = th.getAttribute('aria-sort')
        || (th.classList.contains('ct-sort--asc') ? 'ascending'
        : th.classList.contains('ct-sort--desc') ? 'descending'
        : 'none');
      th.setAttribute('aria-sort', preset);
    });

    // Inject a sort button into every heading.
    headings.forEach((th, index) => {
      if (th.querySelector('.ct-sort-btn')) return;

      const label = th.textContent.trim();
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ct-sort-btn';
      btn.setAttribute('data-index', String(index));
      btn.textContent = label;

      th.textContent = '';
      th.appendChild(btn);
    });

    updateIcons(headings);
    initialiseSortedColumn(headings, tbody);

    // aria-live region so screen readers announce sort changes.
    const status = document.createElement('div');
    status.setAttribute('aria-atomic', 'true');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('role', 'status');
    status.className = 'ct-visually-hidden';
    table.insertAdjacentElement('afterend', status);

    // Abort any previous listener — prevents accumulation when the idempotency
    // guard is cleared on HMR reuse.
    if (table.sortAbort) table.sortAbort.abort();
    const controller = new AbortController();
    table.sortAbort = controller;

    // Single delegated listener on thead — avoids per-button listeners.
    thead.addEventListener('click', (event) => {
      const btn = event.target.closest('.ct-sort-btn');
      if (!btn) return;

      const th = btn.parentElement;
      const current = th.getAttribute('aria-sort');
      const newDir = (current === 'none' || current === 'descending') ? 'ascending' : 'descending';
      const colIndex = parseInt(btn.getAttribute('data-index'), 10);

      headings.forEach((h) => h.setAttribute('aria-sort', 'none'));
      th.setAttribute('aria-sort', newDir);

      updateIcons(headings);
      sortRows(tbody, colIndex, newDir);

      status.textContent = `Sort by ${btn.textContent.trim()} (${newDir})`;
    }, { signal: controller.signal });
  }

  /**
   * Initialise all sortable tables within a given context element.
   *
   * @param {Element|Document} [context=document]
   */
  function initAll(context) {
    (context || document).querySelectorAll('.ct-table--sortable').forEach(initTable);
  }

  // ---------------------------------------------------------------------------
  // Integration.
  // ---------------------------------------------------------------------------

  // Expose globally for Storybook play() and static pages.
  window.DgaTableSort = { initAll };

  // Drupal: register as a behavior for AJAX-safe re-attachment.
  if (typeof Drupal !== 'undefined') {
    Drupal.behaviors.dgaTableSort = {
      attach(context) {
        initAll(context);
      },
    };
  } else {
    // Non-Drupal: init elements in the DOM now, then watch for future
    // insertions via MutationObserver (covers static pages and Storybook).
    initAll();
    new MutationObserver(() => initAll())
      .observe(document.body || document.documentElement, { childList: true, subtree: true });
  }

})();
