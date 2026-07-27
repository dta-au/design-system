/**
 * digital.gov.au Filterable Table component.
 */

/* global Drupal */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Core enhancement — no Drupal dependency.
  // ---------------------------------------------------------------------------

  function initWrapper(wrapper) {
    // Idempotency guard — replaces once().
    if (wrapper.dataset.filterableTableInit) return;
    wrapper.dataset.filterableTableInit = 'true';

    const targetId = wrapper.getAttribute('data-table-id');
    if (!targetId) return;

    // Prefer a sibling target within the story canvas; fall back to
    // document-wide lookup for non-Storybook use.
    const target = wrapper.parentElement?.querySelector(`#${CSS.escape(targetId)}`)
      ?? document.getElementById(targetId);
    if (!target) return;

    // Target type: an explicit data-target-type wins; otherwise infer from the
    // element's tag (<dl> => list, anything else => table). Keeps existing
    // table markup working with no attribute and lets a <dl> opt in by tag.
    const targetType = wrapper.getAttribute('data-target-type')
      || (target.tagName === 'DL' ? 'list' : 'table');

    // Propagate theme class to the target so ct-table / ct-summary-list
    // dark-mode CSS applies.
    const themeClass = Array.from(wrapper.classList).find((c) => /^ct-theme-/.test(c));
    if (themeClass) {
      Array.from(target.classList)
        .filter((c) => /^ct-theme-/.test(c))
        .forEach((c) => target.classList.remove(c));
      target.classList.add(themeClass);
    }

    // Row collection, per-column value access and visibility toggling branch by
    // target type — everything below (select population, text/=== matching,
    // result count) is shared:
    //   table: <tbody> rows; value = cell text at the column index.
    //   list:  [data-filter-row] items; value = data-filter-col-N attribute,
    //          which decouples the filterable value from the displayed text.
    let allRows;
    let getColValue;
    if (targetType === 'list') {
      allRows = Array.from(target.querySelectorAll('[data-filter-row]'));
      getColValue = (row, colIndex) => (row.getAttribute(`data-filter-col-${colIndex}`) || '').trim();
    } else {
      const tbody = target.querySelector('tbody');
      allRows = tbody ? Array.from(tbody.querySelectorAll('tr')) : [];
      getColValue = (row, colIndex) => {
        const cell = row.querySelectorAll('td')[colIndex];
        return cell ? cell.textContent.trim() : '';
      };
    }

    // List rows hide via [hidden] (removed from the a11y tree, keeps <dl>
    // semantics); table rows keep their established style.display toggle.
    const setRowVisible = (row, visible) => {
      if (targetType === 'list') {
        if (visible) row.removeAttribute('hidden');
        else row.setAttribute('hidden', '');
      } else {
        row.style.display = visible ? '' : 'none';
      }
    };

    const rowNoun = targetType === 'list' ? 'items' : 'rows';

    const filterInputs = Array.from(wrapper.querySelectorAll('[data-filter-type]'));
    const clearBtn = wrapper.querySelector('.ct-filterable-table__clear-btn');
    const resultsEl = wrapper.querySelector('.ct-filterable-table__results');

    // -------------------------------------------------------------------------
    // Internal: apply all active filters to the rows.
    // -------------------------------------------------------------------------
    function applyFilters() {
      const activeFilters = filterInputs
        .map((input) => ({
          colIndex: parseInt(input.getAttribute('data-column-index'), 10),
          type: input.getAttribute('data-filter-type'),
          value: input.value.trim().toLowerCase(),
        }))
        .filter((f) => f.value !== '');

      let visibleCount = 0;

      allRows.forEach((row) => {
        const visible = activeFilters.every((filter) => {
          const cellText = getColValue(row, filter.colIndex).toLowerCase();
          if (filter.type === 'text') return cellText.indexOf(filter.value) !== -1;
          if (filter.type === 'select') return cellText === filter.value;
          return true;
        });

        setRowVisible(row, visible);
        if (visible) visibleCount++;
      });

      if (resultsEl) {
        resultsEl.textContent = activeFilters.length === 0
          ? ''
          : `Showing ${visibleCount} of ${allRows.length} ${rowNoun}`;
      }

      if (clearBtn) {
        if (activeFilters.length > 0) {
          clearBtn.removeAttribute('hidden');
        } else {
          clearBtn.setAttribute('hidden', '');
        }
      }
    }

    // -------------------------------------------------------------------------
    // 1. Populate <select> options from the target's column values.
    // -------------------------------------------------------------------------
    filterInputs.forEach((input) => {
      if (input.getAttribute('data-filter-type') !== 'select') return;

      const colIndex = parseInt(input.getAttribute('data-column-index'), 10);
      const seen = new Set();
      const values = [];

      allRows.forEach((row) => {
        const text = getColValue(row, colIndex);
        if (text && !seen.has(text)) {
          seen.add(text);
          values.push(text);
        }
      });

      values.sort();
      values.forEach((val) => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        input.appendChild(opt);
      });
    });

    // -------------------------------------------------------------------------
    // 2. Filter events.
    // -------------------------------------------------------------------------
    filterInputs.forEach((input) => {
      input.addEventListener('input', applyFilters);
      input.addEventListener('change', applyFilters);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        filterInputs.forEach((input) => {
          if (input.tagName === 'SELECT') {
            input.selectedIndex = 0;
          } else {
            input.value = '';
          }
        });
        applyFilters();
      });
    }

    // Initial state.
    applyFilters();
  }

  /**
   * Initialise all filterable table wrappers within a given context element.
   *
   * @param {Element|Document} [context=document]
   */
  function initAll(context) {
    (context || document).querySelectorAll('[data-dga-filterable-table]').forEach(initWrapper);
  }

  // ---------------------------------------------------------------------------
  // Integration.
  // ---------------------------------------------------------------------------

  // Expose globally for Storybook play() and static pages.
  window.DgaFilterableTable = { initAll };

  // Drupal: register as a behavior for AJAX-safe re-attachment.
  if (typeof Drupal !== 'undefined') {
    Drupal.behaviors.dgaFilterableTable = {
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
