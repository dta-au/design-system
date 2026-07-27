/**
 * digital.gov.au Search assistant component.
 */

// Storybook / static-page bootstrap (mirrors decision-tool.js): minimal Drupal
// + once shims so the behaviour runs outside Drupal. The typeof guards keep
// the shims inert on real Drupal pages, where these are already globals.
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

  const GENERATING_MS = 650;
  const TEASER_SPEED_MS = 12;
  const CONTINUATION_SPEED_MS = 14;
  const CHUNK_SIZE = 3;
  const PHASE_STATES = ['generating', 'teaser', 'streaming', 'expanded'];

  // Trailing terminal punctuation is stripped so a punctuated suggestion
  // ("What is api.gov.au?") matches its scripted query, as does a tester
  // typing a question mark.
  function normaliseQuery(query) {
    return (query || '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/[?!.]+$/, '').trim();
  }

  function collapseWhitespace(text) {
    return (text || '').trim().replace(/\s+/g, ' ');
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Reveals text one chunk at a time. Jitter affects timing only, never the
  // text, so output stays deterministic. Reduced motion reveals instantly.
  class Typewriter {
    constructor() {
      this.timer = null;
    }

    stop() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }

    stream(el, text, speed) {
      this.stop();
      if (prefersReducedMotion()) {
        el.textContent = text;
        return;
      }
      let index = 0;
      el.textContent = '';
      const tick = () => {
        index = Math.min(index + CHUNK_SIZE, text.length);
        el.textContent = text.slice(0, index);
        if (index >= text.length) {
          this.timer = null;
          return;
        }
        const jitter = speed * 0.5;
        this.timer = setTimeout(tick, speed - jitter / 2 + Math.random() * jitter);
      };
      this.timer = setTimeout(tick, speed);
    }

    reveal(el, text) {
      this.stop();
      el.textContent = text;
    }
  }

  class SearchAssistant {
    constructor(el) {
      this.el = el;
      this.threshold = parseFloat(el.getAttribute('data-confidence-threshold')) || 0.6;
      this.form = el.querySelector('.ct-search-bar');
      this.input = this.form ? this.form.querySelector('.ct-search-bar__input') : null;
      this.hint = el.querySelector('[data-dga-search-assistant-hint]');
      this.fallback = el.querySelector('[data-dga-search-assistant-fallback]');
      this.fallbackSummary = el.querySelector('[data-dga-search-assistant-fallback-summary]');
      this.fallbackSummaryTemplate = this.fallbackSummary ? this.fallbackSummary.textContent : '';
      const fallbackStatus = this.fallback ? this.fallback.querySelector('.dga-search-assistant__no-answer') : null;
      this.fallbackText = fallbackStatus ? collapseWhitespace(fallbackStatus.textContent) : '';
      this.generatingTimer = null;
      this.teaserWriter = new Typewriter();
      this.continuationWriter = new Typewriter();

      this.entries = Array.from(el.querySelectorAll('[data-dga-search-assistant-entry]')).map((entryEl) => {
        const teaser = entryEl.querySelector('[data-dga-search-assistant-teaser]');
        const continuationText = entryEl.querySelector('[data-dga-search-assistant-continuation-text]');
        return {
          el: entryEl,
          query: normaliseQuery(entryEl.getAttribute('data-query')),
          owner: entryEl.getAttribute('data-owner') || 'full',
          confidence: parseFloat(entryEl.getAttribute('data-confidence')) || 0,
          continuationWorthy: entryEl.getAttribute('data-continuation-worthy') === 'true',
          card: entryEl.querySelector('[data-dga-search-assistant-card]'),
          announce: entryEl.querySelector('[data-dga-search-assistant-announce]'),
          teaser,
          teaserText: teaser ? collapseWhitespace(teaser.textContent) : '',
          toggle: entryEl.querySelector('[data-dga-search-assistant-toggle]'),
          toggleLabel: entryEl.querySelector('[data-dga-search-assistant-toggle-label]'),
          continuation: entryEl.querySelector('[data-dga-search-assistant-continuation]'),
          continuationTextEl: continuationText,
          continuationText: continuationText ? collapseWhitespace(continuationText.textContent) : '',
          suppressedMessage: entryEl.querySelector('[data-dga-search-assistant-suppressed]'),
          // Each follow-on prompt is a disclosure: its own toggle, panel and
          // typewriter, so prompts stream independently.
          prompts: Array.from(entryEl.querySelectorAll('[data-dga-search-assistant-prompt]')).map((toggle) => ({
            toggle,
            query: normaliseQuery(toggle.getAttribute('data-prompt-query')),
            panel: entryEl.querySelector(`#${CSS.escape(toggle.getAttribute('aria-controls'))}`),
            writer: new Typewriter(),
          })),
        };
      });

      this.init();
    }

    init() {
      if (this.form) {
        this.form.addEventListener('submit', (event) => {
          event.preventDefault();
          this.search(this.input ? this.input.value : '');
        });
      }
      this.entries.forEach((entry) => {
        if (entry.toggle) entry.toggle.addEventListener('click', () => this.onToggle(entry));
        // Each follow-on prompt expands in place, like the Show more control,
        // streaming its query's answer into the panel beneath it.
        entry.prompts.forEach((prompt) => {
          if (prompt.panel) prompt.toggle.addEventListener('click', () => this.onTogglePrompt(entry, prompt));
        });
      });
      this.el.setAttribute('data-dga-search-assistant', 'true');
      this.applyForcedState();
    }

    // Demo affordance: data-force-state / data-force-query jump straight to a
    // state on load, so any state can be shown without typing.
    applyForcedState() {
      const state = this.el.getAttribute('data-force-state');
      const query = this.el.getAttribute('data-force-query') || '';
      if (!state || state === 'idle') return;

      if (this.input && query) this.input.value = query;

      if (state === 'fallback') {
        this.reset();
        this.showFallback(query || 'an unscripted question');
        return;
      }
      if (state === 'referral') {
        const entry = this.entries.find((e) => e.owner === 'external');
        if (entry) {
          this.reset();
          this.showReferral(entry);
        }
        return;
      }
      if (state === 'suppressed') {
        const entry = this.entries.find((e) => e.owner === 'none')
          || this.entries.find((e) => e.confidence < this.threshold);
        if (entry) {
          this.reset();
          this.showSuppressed(entry);
        }
        return;
      }
      if (PHASE_STATES.includes(state)) {
        // Only answerable entries have a card; a force_query naming an
        // external or suppressed entry must not reach showAnswer.
        const entry = (query && this.entries.find((e) => e.query === normaliseQuery(query) && this.isAnswerable(e)))
          || this.entries.find((e) => this.isAnswerable(e) && e.continuationWorthy)
          || this.entries.find((e) => this.isAnswerable(e));
        if (entry) {
          if (this.input && !query) this.input.value = entry.query;
          this.reset();
          this.showAnswer(entry, state);
        }
      }
    }

    isAnswerable(entry) {
      return (entry.owner === 'full' || entry.owner === 'partial')
        && entry.card
        && entry.confidence >= this.threshold;
    }

    search(raw) {
      this.reset();
      const query = normaliseQuery(raw);
      if (!query) {
        if (this.hint) this.hint.hidden = false;
        return;
      }
      const entry = this.entries.find((e) => e.query === query) || null;
      if (!entry) {
        this.showFallback(raw.trim());
        return;
      }
      if (entry.owner === 'external') {
        this.showReferral(entry);
        return;
      }
      if (!this.isAnswerable(entry)) {
        this.showSuppressed(entry);
        return;
      }
      this.showAnswer(entry, null);
    }

    // The streamed elements are not live regions; the full text goes into the
    // card's hidden live region once, when the stream starts, so screen
    // readers hear it whole rather than every partial chunk.
    announce(entry, text) {
      if (entry.announce) entry.announce.textContent = text;
    }

    reset() {
      if (this.generatingTimer) {
        clearTimeout(this.generatingTimer);
        this.generatingTimer = null;
      }
      this.teaserWriter.stop();
      this.continuationWriter.stop();
      if (this.hint) this.hint.hidden = true;
      if (this.fallback) this.fallback.hidden = true;
      this.entries.forEach((entry) => {
        entry.el.hidden = true;
        if (entry.announce) entry.announce.textContent = '';
        if (entry.suppressedMessage) entry.suppressedMessage.hidden = true;
        if (entry.card) {
          entry.card.hidden = false;
          entry.card.removeAttribute('data-phase');
        }
        if (entry.teaser) entry.teaser.textContent = entry.teaserText;
        entry.prompts.forEach((prompt) => this.collapsePrompt(prompt));
        this.collapse(entry);
      });
    }

    collapse(entry) {
      if (!entry.toggle) return;
      entry.toggle.setAttribute('aria-expanded', 'false');
      if (entry.toggleLabel) {
        entry.toggleLabel.textContent = entry.toggle.getAttribute('data-show-more-label') || 'Show more';
      }
      if (entry.continuation) entry.continuation.hidden = true;
      if (entry.continuationTextEl) entry.continuationTextEl.textContent = entry.continuationText;
    }

    expand(entry, instant) {
      if (!entry.toggle || !entry.continuation) return;
      entry.toggle.setAttribute('aria-expanded', 'true');
      if (entry.toggleLabel) {
        entry.toggleLabel.textContent = entry.toggle.getAttribute('data-show-less-label') || 'Show less';
      }
      entry.continuation.hidden = false;
      this.announce(entry, entry.continuationText);
      if (instant) {
        this.continuationWriter.reveal(entry.continuationTextEl, entry.continuationText);
      } else {
        this.continuationWriter.stream(entry.continuationTextEl, entry.continuationText, CONTINUATION_SPEED_MS);
      }
    }

    onToggle(entry) {
      if (entry.toggle.getAttribute('aria-expanded') === 'true') {
        this.continuationWriter.stop();
        this.collapse(entry);
      } else {
        this.expand(entry, false);
      }
    }

    collapsePrompt(prompt) {
      prompt.writer.stop();
      prompt.toggle.setAttribute('aria-expanded', 'false');
      if (prompt.panel) {
        prompt.panel.hidden = true;
        prompt.panel.textContent = '';
      }
    }

    // Expanding a prompt streams the matched scripted answer into its panel.
    // Prompts are curated to answerable queries; anything else gets the
    // fallback status rather than a fabricated answer.
    onTogglePrompt(entry, prompt) {
      if (prompt.toggle.getAttribute('aria-expanded') === 'true') {
        this.collapsePrompt(prompt);
        return;
      }
      prompt.toggle.setAttribute('aria-expanded', 'true');
      prompt.panel.hidden = false;
      const target = this.entries.find((e) => e.query === prompt.query);
      const text = (target && this.isAnswerable(target) && target.teaserText)
        ? target.teaserText
        : this.fallbackText;
      this.announce(entry, text);
      prompt.writer.stream(prompt.panel, text, TEASER_SPEED_MS);
    }

    showAnswer(entry, forcedPhase) {
      entry.el.hidden = false;
      if (forcedPhase === 'generating') {
        entry.card.setAttribute('data-phase', 'generating');
        return;
      }
      if (forcedPhase) {
        // teaser, streaming or expanded: teaser shows in full, no stream.
        entry.card.setAttribute('data-phase', forcedPhase);
        this.announce(entry, entry.teaserText);
        this.teaserWriter.reveal(entry.teaser, entry.teaserText);
        if (forcedPhase === 'streaming') this.expand(entry, false);
        if (forcedPhase === 'expanded') this.expand(entry, true);
        return;
      }
      // Live flow: a brief generating pause, then the teaser streams.
      entry.card.setAttribute('data-phase', 'generating');
      this.generatingTimer = setTimeout(() => {
        this.generatingTimer = null;
        entry.card.setAttribute('data-phase', 'teaser');
        this.announce(entry, entry.teaserText);
        this.teaserWriter.stream(entry.teaser, entry.teaserText, TEASER_SPEED_MS);
      }, prefersReducedMotion() ? 0 : GENERATING_MS);
    }

    showSuppressed(entry) {
      entry.el.hidden = false;
      if (entry.card) entry.card.hidden = true;
      if (entry.suppressedMessage) entry.suppressedMessage.hidden = false;
    }

    showReferral(entry) {
      entry.el.hidden = false;
    }

    showFallback(query) {
      if (!this.fallback) return;
      this.fallback.hidden = false;
      if (this.fallbackSummary) {
        this.fallbackSummary.textContent = this.fallbackSummaryTemplate.replace('@query', query);
      }
    }
  }

  Drupal.behaviors.dgaSearchAssistant = {
    attach(context) {
      once('dga-search-assistant', '[data-dga-search-assistant]', context).forEach((el) => new SearchAssistant(el));
    },
  };
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
