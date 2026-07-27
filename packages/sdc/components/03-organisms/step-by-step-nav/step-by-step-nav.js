/**
 * digital.gov.au Step by Step Nav component.
 */

/* global Drupal */

function CivicThemeStepByStepNav(el) {
  if (el.getAttribute('data-step-by-step-nav') === 'true' || this.el) {
    return;
  }

  this.el = el;
  this.steps = Array.from(el.querySelectorAll('[data-collapsible]'));
  this.toggleButton = null;

  if (!this.steps.length) {
    return;
  }

  this.injectToggle();
  this.updateToggle();

  const observer = new MutationObserver(this.updateToggle.bind(this));
  this.steps.forEach(function (step) {
    observer.observe(step, { attributes: true, attributeFilter: ['data-collapsible-collapsed'] });
  });

  el.setAttribute('data-step-by-step-nav', 'true');
}

CivicThemeStepByStepNav.prototype.injectToggle = function () {
  const stepsEl = this.el.querySelector('.ct-step-by-step-nav__steps');

  if (!stepsEl) {
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'ct-step-by-step-nav__toggle';

  const btn = document.createElement('button');
  btn.className = 'ct-step-by-step-nav__toggle__button';
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-expanded', 'false');
  btn.textContent = 'Show all steps';
  btn.addEventListener('click', this.onToggleAll.bind(this));

  wrapper.appendChild(btn);
  stepsEl.before(wrapper);
  this.toggleButton = btn;
};

CivicThemeStepByStepNav.prototype.allExpanded = function () {
  return this.steps.every(function (step) {
    return !step.hasAttribute('data-collapsible-collapsed');
  });
};

CivicThemeStepByStepNav.prototype.updateToggle = function () {
  if (!this.toggleButton) {
    return;
  }

  const expanded = this.allExpanded();
  this.toggleButton.textContent = expanded ? 'Hide all steps' : 'Show all steps';
  this.toggleButton.setAttribute('aria-expanded', String(expanded));
};

CivicThemeStepByStepNav.prototype.onToggleAll = function () {
  const expand = !this.allExpanded();
  const eventName = expand ? 'ct.collapsible.expand' : 'ct.collapsible.collapse';

  this.steps.forEach(function (step) {
    step.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      detail: { animate: true },
    }));
  });
};

function initAll(context) {
  (context || document).querySelectorAll('[data-step-by-step-nav]').forEach(function (el) {
    new CivicThemeStepByStepNav(el);
  });
}

// A top-level sweep alone runs at module evaluation, before Storybook mounts
// the story markup, so nothing initialises. Dual-init instead: Drupal
// re-attaches via behaviors; elsewhere sweep now and re-sweep on insertion.
if (typeof Drupal !== 'undefined') {
  Drupal.behaviors.civicThemeStepByStepNav = {
    attach(context) {
      initAll(context);
    },
  };
} else {
  initAll();
  new MutationObserver(function () { initAll(); })
    .observe(document.body || document.documentElement, { childList: true, subtree: true });
}
