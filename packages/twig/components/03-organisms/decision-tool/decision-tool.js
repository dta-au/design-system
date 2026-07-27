/**
 * digital.gov.au Decision tool component.
 */

// Storybook / static-page bootstrap (mirrors chart.js): minimal Drupal + once
// shims so the behaviour runs outside Drupal. The typeof guards keep the shims
// inert on real Drupal pages, where these are already globals.
(function () {
  'use strict';
  if (typeof window.Drupal === 'undefined') {
    window.Drupal = {
      behaviors: {},
      t: (str, args) => {
        if (!args) return str;
        return String(str).replace(/[@!%][\w-]+/g, (m) => (m in args ? String(args[m]) : m));
      },
    };
  }
  if (typeof window.once === 'undefined') {
    const marks = new WeakMap();
    window.once = function (id, selector, context) {
      const root = context || document;
      const out = [];
      root.querySelectorAll(selector).forEach((el) => {
        const keys = marks.get(el) || new Set();
        if (keys.has(id)) return;
        keys.add(id);
        marks.set(el, keys);
        out.push(el);
      });
      return out;
    };
  }
})();

(function (Drupal, once) {
  'use strict';

  // Crockford base32 alphabet (no I, L, O, U to cut transcription errors) for
  // the data characters; the 37-symbol superset adds the Crockford check
  // symbols for the trailing check character.
  const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const CHECK_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ*~$=U';
  const CODE_LENGTH = 8;

  function splitList(value) {
    return (value || '').split(',').map((s) => s.trim()).filter(Boolean);
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function svgNode(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
    return el;
  }

  // progress-tracker completed-marker check. The marker circle is CSS; only the
  // check is an SVG, matching progress-tracker.twig.
  function trackerCheck() {
    const svg = svgNode('svg', { class: 'progress-marker__icon', viewBox: '0 0 24 24', focusable: 'false' });
    svg.appendChild(svgNode('polyline', { points: '5 12.5 10 17.5 19 7' }));
    return svg;
  }

  Drupal.behaviors.dgaDecisionTool = {
    attach(context) {
      once('dga-decision-tool', '[data-dga-decision-tool]', context).forEach((el) => {
        // eslint-disable-next-line no-use-before-define
        new DecisionTool(el).init();
      });
    },
  };

  class DecisionTool {
    constructor(root) {
      this.root = root;
      this.id = root.dataset.dgaDecisionToolId || null;
      this.storageKey = root.dataset.dgaDecisionToolStorageKey || null;

      this.steps = Array.from(root.querySelectorAll('[data-dga-decision-tool-step]'));
      this.outcomes = Array.from(root.querySelectorAll('[data-dga-decision-tool-outcome]'));
      this.stepsWrap = root.querySelector('[data-dga-decision-tool-steps]');
      this.nav = root.querySelector('[data-dga-decision-tool-nav]');
      this.resultWrap = root.querySelector('[data-dga-decision-tool-result]');
      this.statusEl = root.querySelector('[data-dga-decision-tool-status]');
      this.progressEl = root.querySelector('[data-dga-decision-tool-progress]');

      this.backWrap = root.querySelector('[data-dga-decision-tool-back]');
      this.nextWrap = root.querySelector('[data-dga-decision-tool-advance-next]');
      this.submitWrap = root.querySelector('[data-dga-decision-tool-advance-submit]');
      this.restartWrap = root.querySelector('[data-dga-decision-tool-restart]');
      this.backBtn = this.backWrap ? this.backWrap.querySelector('.ct-button') : null;
      this.nextBtn = this.nextWrap ? this.nextWrap.querySelector('.ct-button') : null;
      this.submitBtn = this.submitWrap ? this.submitWrap.querySelector('.ct-button') : null;
      this.restartBtn = this.restartWrap ? this.restartWrap.querySelector('.ct-button') : null;

      this.summaryEl = root.querySelector('[data-dga-decision-tool-summary]');
      this.summaryList = this.summaryEl ? this.summaryEl.querySelector('[data-dga-decision-tool-summary-list]') : null;

      this.history = [];
    }

    init() {
      if (!this.steps.length || !this.stepsWrap || !this.nav || !this.resultWrap) return;
      this.root.setAttribute('data-enhanced', 'true');
      this.bind();
      this.history = [this.steps[0]];
      this.showCurrent(false);
    }

    bind() {
      this.stepsWrap.addEventListener('change', () => this.onChange());
      if (this.backBtn) this.backBtn.addEventListener('click', (e) => { e.preventDefault(); this.back(); });
      if (this.nextBtn) this.nextBtn.addEventListener('click', (e) => { e.preventDefault(); this.advance(); });
      if (this.submitBtn) this.submitBtn.addEventListener('click', (e) => { e.preventDefault(); this.advance(); });
      if (this.restartBtn) this.restartBtn.addEventListener('click', (e) => { e.preventDefault(); this.restart(); });
    }

    current() {
      return this.history[this.history.length - 1];
    }

    stepById(id) {
      return this.steps.find((s) => s.dataset.stepId === id) || null;
    }

    hasSelection(step) {
      return !!step.querySelector('[data-dga-decision-tool-option]:checked');
    }

    /** Resolve where the current step leads, given the live selection. */
    resolveNext(step) {
      if (!this.hasSelection(step)) return null;
      if (step.dataset.stepType !== 'multiple') {
        const checked = step.querySelector('[data-dga-decision-tool-option]:checked');
        if (checked && checked.dataset.next) return checked.dataset.next;
      }
      if (step.dataset.defaultNext) return step.dataset.defaultNext;
      const idx = this.steps.indexOf(step);
      if (idx > -1 && idx < this.steps.length - 1) return this.steps[idx + 1].dataset.stepId;
      return 'result';
    }

    showCurrent(focus) {
      const step = this.current();
      this.resultWrap.hidden = true;
      this.steps.forEach((s) => {
        const active = s === step;
        s.hidden = !active;
        s.classList.toggle('dga-decision-tool__step--active', active);
      });
      this.outcomes.forEach((o) => { o.hidden = true; });
      this.nav.hidden = false;
      this.renderProgress();
      this.updateNav();
      this.renderSummary(false);
      if (focus) {
        const heading = step.querySelector('[data-dga-decision-tool-step-heading]');
        if (heading) heading.focus();
        this.announce(Drupal.t('Step @n.', { '@n': this.history.length }));
      }
    }

    renderProgress(isComplete) {
      if (!this.progressEl) return;
      this.progressEl.hidden = false;
      if (this.progressEl.dataset.progressStyle === 'bar') {
        this.renderProgressBar(isComplete);
      } else {
        this.renderProgressTracker(isComplete);
      }
    }

    /**
     * Horizontal progress-tracker over ALL defined steps (the page count): each
     * marker is complete (visited, shown with a check), active (current), or
     * to-do (not yet visited). When a branch skips steps the active marker just
     * lands further along - the skipped markers stay to-do.
     */
    renderProgressTracker(isComplete) {
      let tracker = this.progressEl.querySelector('.progress-tracker');
      if (!tracker) {
        tracker = document.createElement('ol');
        tracker.className = 'progress-tracker';
        this.progressEl.appendChild(tracker);
      }
      const current = this.current();
      const visited = new Set(this.history);
      const frag = document.createDocumentFragment();
      this.steps.forEach((step, i) => {
        const isCurrent = !isComplete && step === current;
        const done = isComplete || (visited.has(step) && !isCurrent);
        const item = document.createElement('li');
        item.className = 'progress-step';
        if (done) item.classList.add('is-complete');
        if (isCurrent) {
          item.classList.add('is-active');
          item.setAttribute('aria-current', 'step');
        }

        const marker = document.createElement('span');
        marker.className = 'progress-marker';
        marker.setAttribute('aria-hidden', 'true');
        if (done) marker.appendChild(trackerCheck());
        else marker.textContent = String(i + 1);

        const status = document.createElement('span');
        status.className = 'ct-visually-hidden';
        if (done) status.textContent = Drupal.t('Step @n, completed', { '@n': i + 1 });
        else if (isCurrent) status.textContent = Drupal.t('Step @n, current', { '@n': i + 1 });
        else status.textContent = Drupal.t('Step @n, not started', { '@n': i + 1 });

        item.append(marker, status);
        frag.appendChild(item);
      });
      tracker.replaceChildren(frag);
    }

    /** Simple filled progress bar with a "Step N of T" / "Complete" label. */
    renderProgressBar(isComplete) {
      let label = this.progressEl.querySelector('[data-dga-decision-tool-bar-label]');
      let fill = this.progressEl.querySelector('[data-dga-decision-tool-bar-fill]');
      if (!label) {
        const wrap = document.createElement('div');
        wrap.className = 'dga-decision-tool__bar';
        label = document.createElement('p');
        label.className = 'dga-decision-tool__bar-label';
        label.setAttribute('data-dga-decision-tool-bar-label', '');
        const track = document.createElement('div');
        track.className = 'dga-decision-tool__bar-track';
        track.setAttribute('aria-hidden', 'true');
        fill = document.createElement('span');
        fill.className = 'dga-decision-tool__bar-fill';
        fill.setAttribute('data-dga-decision-tool-bar-fill', '');
        track.appendChild(fill);
        wrap.append(label, track);
        this.progressEl.appendChild(wrap);
      }
      const total = this.steps.length || 1;
      const idx = this.steps.indexOf(this.current());
      const stepNum = idx > -1 ? idx + 1 : this.history.length;
      const pct = isComplete ? 100 : Math.round((stepNum / total) * 100);
      label.textContent = isComplete
        ? Drupal.t('Complete')
        : Drupal.t('Step @n of @t', { '@n': stepNum, '@t': total });
      fill.style.width = `${pct}%`;
    }

    updateNav() {
      const step = this.current();
      const isLinkCard = step.dataset.stepOptionStyle === 'link-card';
      if (this.backWrap) this.backWrap.hidden = this.history.length <= 1;
      if (isLinkCard) {
        // Link-card steps advance on selection, so they carry no Next/Submit.
        if (this.nextWrap) this.nextWrap.hidden = true;
        if (this.submitWrap) this.submitWrap.hidden = true;
        return;
      }
      const toResult = this.resolveNext(step) === 'result';
      if (this.nextWrap) this.nextWrap.hidden = toResult;
      if (this.submitWrap) this.submitWrap.hidden = !toResult;
    }

    onChange() {
      this.updateNav();
      const step = this.current();
      // Link-card single-choice steps advance as soon as an option is chosen.
      if (step && step.dataset.stepOptionStyle === 'link-card' && this.hasSelection(step)) {
        this.advance();
      }
    }

    /** The chosen option label(s) for a step, for the answer summary. */
    answerText(step) {
      const labels = [];
      step.querySelectorAll('[data-dga-decision-tool-option]:checked').forEach((input) => {
        const option = input.closest('.dga-decision-tool__option');
        const label = option ? option.querySelector('.dga-decision-tool__option-label') : null;
        if (label) labels.push(label.textContent.trim());
      });
      return labels.join(', ');
    }

    /**
     * Fill the "what you have answered" review. During the flow it lists the
     * answered steps before the current one; on the result it lists them all.
     * Each row has a Change link that jumps back to that step.
     */
    renderSummary(onResult) {
      if (!this.summaryList || !this.summaryEl) return;
      const candidates = onResult ? this.history : this.history.slice(0, -1);
      const answered = candidates.filter((step) => this.hasSelection(step));
      if (!answered.length) {
        this.summaryEl.hidden = true;
        return;
      }
      this.summaryEl.hidden = false;
      const changeLabel = this.summaryEl.dataset.changeLabel || Drupal.t('Change');
      const frag = document.createDocumentFragment();
      answered.forEach((step, i) => {
        const item = document.createElement('li');
        item.className = 'dga-decision-tool__summary-item';

        const number = document.createElement('span');
        number.className = 'dga-decision-tool__summary-number';
        number.setAttribute('aria-hidden', 'true');
        number.textContent = String(i + 1);

        const heading = step.querySelector('[data-dga-decision-tool-step-heading]');
        const question = heading ? heading.textContent.trim() : '';

        const body = document.createElement('span');
        body.className = 'dga-decision-tool__summary-body';
        const q = document.createElement('span');
        q.className = 'dga-decision-tool__summary-question';
        q.textContent = question;
        const a = document.createElement('span');
        a.className = 'dga-decision-tool__summary-answer';
        a.textContent = this.answerText(step);
        body.append(q, a);

        const change = document.createElement('button');
        change.type = 'button';
        change.className = 'dga-decision-tool__summary-change';
        change.textContent = changeLabel;
        const hidden = document.createElement('span');
        hidden.className = 'ct-visually-hidden';
        hidden.textContent = `: ${question}`;
        change.appendChild(hidden);
        change.addEventListener('click', (e) => { e.preventDefault(); this.changeStep(step); });

        item.append(number, body, change);
        frag.appendChild(item);
      });
      this.summaryList.replaceChildren(frag);
    }

    /** Jump back to a step to change its answer; later answers are dropped. */
    changeStep(step) {
      const idx = this.history.indexOf(step);
      if (idx === -1) return;
      this.history = this.history.slice(0, idx + 1);
      this.outcomes.forEach((o) => { o.hidden = true; o.removeAttribute('tabindex'); });
      this.showCurrent(true);
    }

    advance() {
      const step = this.current();
      if (!this.hasSelection(step)) {
        this.announce(Drupal.t('Select an answer to continue.'));
        const first = step.querySelector('[data-dga-decision-tool-option]');
        if (first) first.focus();
        return;
      }
      const target = this.resolveNext(step);
      const next = target === 'result' ? null : this.stepById(target);
      if (!next) {
        this.complete();
        return;
      }
      this.history.push(next);
      this.showCurrent(true);
    }

    back() {
      if (this.history.length <= 1) return;
      this.history.pop();
      this.showCurrent(true);
    }

    restart() {
      this.steps.forEach((s) => {
        s.querySelectorAll('[data-dga-decision-tool-option]:checked').forEach((input) => {
          input.checked = false;
        });
      });
      this.outcomes.forEach((o) => {
        o.hidden = true;
        o.removeAttribute('tabindex');
      });
      this.history = [this.steps[0]];
      this.showCurrent(true);
    }

    /** Union of flags from every selected option along the visited path. */
    collectFlags() {
      const flags = [];
      const seen = new Set();
      this.history.forEach((step) => {
        step.querySelectorAll('[data-dga-decision-tool-option]:checked').forEach((input) => {
          splitList(input.dataset.flags).forEach((flag) => {
            if (!seen.has(flag)) {
              seen.add(flag);
              flags.push(flag);
            }
          });
        });
      });
      return flags;
    }

    /** First outcome whose when-condition holds; last is the fallback. */
    matchOutcome(flags) {
      const set = new Set(flags);
      for (let i = 0; i < this.outcomes.length; i += 1) {
        const outcome = this.outcomes[i];
        const all = splitList(outcome.dataset.whenAll);
        const any = splitList(outcome.dataset.whenAny);
        const allOk = all.every((flag) => set.has(flag));
        const anyOk = any.length === 0 || any.some((flag) => set.has(flag));
        if (allOk && anyOk) return outcome;
      }
      return this.outcomes[this.outcomes.length - 1] || null;
    }

    complete() {
      const flags = this.collectFlags();
      const outcome = this.matchOutcome(flags);
      const code = this.generateCode();

      this.steps.forEach((s) => { s.hidden = true; });
      this.nav.hidden = true;
      // Bar style shows "Complete" on the result; the step tracker is hidden.
      if (this.progressEl) {
        if (this.progressEl.dataset.progressStyle === 'bar') {
          this.progressEl.hidden = false;
          this.renderProgressBar(true);
        } else {
          this.progressEl.hidden = true;
        }
      }
      this.resultWrap.hidden = false;
      this.outcomes.forEach((o) => { o.hidden = o !== outcome; });
      this.renderSummary(true);

      let outcomeId = null;
      if (outcome) {
        outcomeId = outcome.dataset.outcomeId || null;
        const codeEl = outcome.querySelector('[data-dga-decision-tool-code]');
        if (codeEl) codeEl.textContent = code || '';
        this.wireCopy(outcome);
        outcome.setAttribute('tabindex', '-1');
        outcome.focus();
      }
      this.announce(Drupal.t('Assessment complete. Your reference code is ready below.'));

      const detail = {
        questionSetId: this.id,
        outcomeId,
        flags,
        referenceCode: code,
      };
      this.root.dispatchEvent(new CustomEvent('civictheme:decision-tool:complete', {
        bubbles: true,
        detail,
      }));

      if (this.storageKey) {
        try {
          window.sessionStorage.setItem(this.storageKey, JSON.stringify(detail));
        } catch (e) {
          // sessionStorage can be unavailable (private mode, disabled); the
          // event is still dispatched, so the host is not blocked.
        }
      }
    }

    wireCopy(outcome) {
      const wrap = outcome.querySelector('[data-dga-decision-tool-copy]');
      if (!wrap || wrap.dataset.bound === 'true') return;
      const btn = wrap.querySelector('.ct-button');
      const codeEl = outcome.querySelector('[data-dga-decision-tool-code]');
      if (!btn || !codeEl) return;
      wrap.dataset.bound = 'true';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const text = codeEl.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            () => this.announce(Drupal.t('Reference code copied to the clipboard.')),
            () => this.selectCode(codeEl)
          );
        } else {
          this.selectCode(codeEl);
        }
      });
    }

    selectCode(codeEl) {
      if (typeof window.getSelection === 'undefined') return;
      const range = document.createRange();
      range.selectNodeContents(codeEl);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      this.announce(Drupal.t('Reference code selected. Press Control or Command, then C, to copy.'));
    }

    /** Opaque, cryptographically-random base32 code with a Crockford check. */
    generateCode() {
      const cryptoObj = window.crypto || window.msCrypto;
      if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
        if (window.console) {
          window.console.warn('[dga-decision-tool] Web Crypto unavailable; no reference code generated.');
        }
        return null;
      }
      const bytes = new Uint8Array(CODE_LENGTH);
      cryptoObj.getRandomValues(bytes);
      let data = '';
      let acc = 0;
      for (let i = 0; i < CODE_LENGTH; i += 1) {
        const value = bytes[i] % 32;
        data += ALPHABET.charAt(value);
        acc = (acc * 32 + value) % 37;
      }
      return `${data.slice(0, 4)}-${data.slice(4, 8)}-${CHECK_ALPHABET.charAt(acc)}`;
    }

    announce(message) {
      if (this.statusEl) this.statusEl.textContent = message;
    }
  }
})(window.Drupal, window.once);

// Static-page driver. Drupal core runs Drupal.attachBehaviors() after page load
// and each AJAX swap; without it the behaviour above is registered but never
// attached. Provide a minimal runner on DOMContentLoaded and on each DOM
// mutation so async-rendered stories still trigger. once() inside the behaviour
// deduplicates, so repeated calls are cheap. Inert on Drupal, where
// attachBehaviors is already a function.
(function () {
  'use strict';
  if (typeof window.Drupal === 'undefined' || typeof window.Drupal.attachBehaviors === 'function') {
    return;
  }
  const attach = (context) => {
    Object.values(window.Drupal.behaviors).forEach((b) => {
      if (b && typeof b.attach === 'function') b.attach(context || document);
    });
  };
  window.Drupal.attachBehaviors = attach;
  const run = () => attach(document);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  new MutationObserver(run).observe(
    document.body || document.documentElement,
    { childList: true, subtree: true }
  );
})();
