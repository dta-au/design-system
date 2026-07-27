/**
 * CivicTheme Tabs component.
 */

function CivicThemeTabs(el, selectedIndex) {
  if (!el) {
    return;
  }

  this.el = el;
  this.links = this.el.querySelectorAll('[data-tabs-tab]');
  this.panels = this.el.querySelectorAll('[data-tabs-panel]');

  if (this.links.length === 0
    || this.panels.length === 0
    || this.links.length !== this.panels.length
  ) {
    return;
  }

  this.init(selectedIndex);
}

CivicThemeTabs.prototype.init = function () {
  this.clickListener = this.clickEvent.bind(this);

  let selected = 0;
  for (let i = 0; i < this.panels.length; i++) {
    this.links[i].addEventListener('click', this.clickListener, false);

    if (this.panels[i].classList.contains('ct-tabs__panel--selected') && !selected) {
      selected = i;
    }
  }

  this.links[selected].click();
};

CivicThemeTabs.prototype.clickEvent = function (e) {
  e.preventDefault();

  this.setSelected(e.currentTarget);
};

CivicThemeTabs.prototype.setSelected = function (current) {
  for (let i = 0; i < this.panels.length; i++) {
    const currentLink = this.links[i];
    if (currentLink === current) {
      currentLink.classList.add('ct-tabs__tab--selected');
      currentLink.setAttribute('aria-selected', true);
      this.panels[i].classList.add('ct-tabs__panel--selected');
      this.panels[i].setAttribute('aria-hidden', false);
    } else {
      currentLink.classList.remove('ct-tabs__tab--selected');
      currentLink.setAttribute('aria-selected', false);
      this.panels[i].classList.remove('ct-tabs__panel--selected');
      this.panels[i].setAttribute('aria-hidden', true);
    }
  }
};

CivicThemeTabs.prototype.destroy = function () {
  for (let i = 0; i < this.panels.length; i++) {
    this.links[i].removeAttribute('aria-selected');
    this.links[i].classList.remove('ct-tabs__tab--selected');
    this.links[i].removeEventListener('click', this.clickListener, false);

    this.panels[i].removeAttribute('aria-hidden');
    this.panels[i].classList.remove('ct-tabs__panel--selected');
  }
};

document.querySelectorAll('.ct-tabs').forEach((tabs) => {
  new CivicThemeTabs(tabs);
});

/**
 * CivicTheme Tabs mobile disclosure (collapse_mobile, links-only).
 *
 * Below the m breakpoint the links collapse into a <details>; at and above m
 * the summary is hidden by CSS and the bar shows. Force the disclosure open on
 * desktop and closed on mobile, toggling only when the breakpoint is actually
 * crossed so a user's manual open/close is preserved within a breakpoint. Runs
 * as its own pass: CivicThemeTabs early-returns without panels, so it never
 * reaches links-only tabs.
 */
function CivicThemeTabsDisclosure(el) {
  if (!el) {
    return;
  }

  this.el = el;
  this.summary = el.querySelector('summary');

  if (!this.summary) {
    return;
  }

  this.wasDesktop = null;
  this.syncListener = this.sync.bind(this);
  this.sync();
  window.addEventListener('resize', this.syncListener, false);
}

CivicThemeTabsDisclosure.prototype.sync = function () {
  // CSS hides the summary at >= m, so a hidden summary means desktop. Keeps the
  // breakpoint value in the SCSS rather than duplicated as a literal here.
  const isDesktop = window.getComputedStyle(this.summary).display === 'none';

  if (isDesktop !== this.wasDesktop) {
    this.el.open = isDesktop;
    this.wasDesktop = isDesktop;
  }
};

document.querySelectorAll('[data-tabs-disclosure]').forEach((el) => {
  new CivicThemeTabsDisclosure(el);
});
