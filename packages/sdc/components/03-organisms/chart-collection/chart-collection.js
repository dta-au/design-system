/**
 * digital.gov.au Chart Collection component.
 */

/* global Drupal */

(function () {
  'use strict';

  function initCollection(root) {
    // Idempotency guard - replaces once().
    if (root.dataset.bdgaChartCollectionInit) return;
    root.dataset.bdgaChartCollectionInit = 'true';

    const btn = root.querySelector('[data-bdga-chart-collection-tables]');
    if (!btn) return;
    const details = Array.from(root.querySelectorAll('details.bdga-chart__data'));
    if (!details.length) {
      btn.hidden = true;
      return;
    }

    const allOpen = () => details.every((d) => d.open);
    const sync = () => {
      const open = allOpen();
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? btn.dataset.labelHide : btn.dataset.labelShow;
    };

    btn.addEventListener('click', () => {
      const target = !allOpen();
      details.forEach((d) => {
        d.open = target;
      });
      sync();
    });

    // `toggle` does not bubble; a capture listener still observes descendant
    // events, so a panel's own summary or "View as table" flips keep the
    // collection button honest.
    root.addEventListener('toggle', sync, true);
    sync();
  }

  /**
   * Initialise all chart collections within a given context element.
   *
   * @param {Element|Document} [context=document]
   */
  function initAll(context) {
    (context || document).querySelectorAll('[data-bdga-chart-collection]').forEach(initCollection);
  }

  // Expose globally for Storybook play() and static pages.
  window.DgaChartCollection = { initAll };

  // Drupal: register as a behavior for AJAX-safe re-attachment.
  if (typeof Drupal !== 'undefined') {
    Drupal.behaviors.bdgaChartCollection = {
      attach(context) {
        initAll(context);
      },
    };
  } else {
    // Non-Drupal: init now, then watch for future insertions.
    initAll();
    new MutationObserver(() => initAll())
      .observe(document.body || document.documentElement, { childList: true, subtree: true });
  }
})();
