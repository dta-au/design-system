/**
 * digital.gov.au Search Form component.
 */

// phpcs:ignoreFile
/* global Drupal */
function ctSearchFormInit(context) {
  (context || document).querySelectorAll('[data-search-form-field]').forEach(function (field) {
    if (field.getAttribute('data-search-form') === 'true') {
      return;
    }
    var input = field.querySelector('input');
    if (!input) {
      return;
    }
    field.setAttribute('data-search-form', 'true');

    function sync() {
      field.classList.toggle('has-value', input.value.trim() !== '');
    }

    input.addEventListener('input', sync);
    sync(); // handle pre-filled values on page load / back navigation
  });
}

// Drupal: re-attach on AJAX-inserted markup.
if (typeof Drupal !== 'undefined') {
  Drupal.behaviors.ctSearchForm = {
    attach: function (context) {
      ctSearchFormInit(context);
    },
  };
}

// Storybook (no Drupal): re-run when a story injects markup after module eval.
if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined' && document.body) {
  new MutationObserver(function () {
    ctSearchFormInit(document);
  }).observe(document.body, { childList: true, subtree: true });
}

ctSearchFormInit(document);
