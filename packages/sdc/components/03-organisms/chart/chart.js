/**
 * digital.gov.au Chart component.
 */

// Storybook / static-page bootstrap. In Drupal, Drupal.behaviors + once are
// real globals and Drupal.attachBehaviors() runs the registered behaviour
// after each AJAX swap. Outside Drupal (this UIKit's Storybook, static demo
// pages), neither exists, so the file would throw at load. Provide minimal
// shims, then run behaviours on DOMContentLoaded and on each DOM mutation so
// stories that mount their chart markup async still pick it up. Drupal pages
// already have these globals — the typeof guards keep the shims inert there.
(function () {
  'use strict';
  if (typeof window.Drupal === 'undefined') {
    // Drupal.t in core substitutes @placeholder / !placeholder / %placeholder
    // tokens from the second arg. The renderer uses @count and @nodes — without
    // substitution the live-status string renders as
    // "Chart loaded. @count rows."
    // Reproduce just enough of core's contract so the status reads naturally
    // in Storybook.
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

  const ALLOWED_HOSTS = ['data.gov.au', 'www.data.gov.au'];
  const MAX_ROWS = 5000;
  const FETCH_TIMEOUT_MS = 10000;
  // Per-cell string cap for extracted CKAN rows. Protects against shipping
  // multi-KB descriptive prose columns when an author runs a SELECT * style
  // query; row count is already clamped by MAX_ROWS. 500 chars covers every
  // realistic chart label.
  const MAX_CELL_CHARS = 500;

  // Presentation properties inlined onto a cloned <svg> at export time, so the
  // standalone SVG / PNG renders without the page CSS or the --bdga-chart-*
  // custom properties the on-page chart resolves against.
  const EXPORT_STYLE_PROPS = [
    'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity',
    'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity',
    'color', 'font-family', 'font-size', 'font-weight', 'font-style',
    'text-anchor', 'dominant-baseline', 'letter-spacing', 'visibility',
  ];

  // Funnel + chevron icons copied from the tabs mobile disclosure (tabs.twig)
  // so the filter controls reuse that disclosure's look. Static trusted markup.
  // eslint-disable-next-line max-len
  const FILTER_ICON_SVG = '<svg class="ct-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true"><path d="M440-160q-17 0-28.5-11.5T400-200v-240L168-736q-15-20-4.5-42t36.5-22h560q26 0 36.5 22t-4.5 42L560-440v240q0 17-11.5 28.5T520-160h-80Zm40-308 198-252H282l198 252Zm0 0Z"/></svg>';
  // eslint-disable-next-line max-len
  const FILTER_CHEVRON_SVG = '<svg class="ct-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.6072 8.38619C18.3583 8.13884 18.0217 8 17.6709 8C17.32 8 16.9834 8.13884 16.7346 8.38619L11.9668 13.0876L7.26542 8.38619C7.01659 8.13884 6.67999 8 6.32913 8C5.97827 8 5.64167 8.13884 5.39284 8.38619C5.26836 8.50965 5.16956 8.65654 5.10214 8.81838C5.03471 8.98022 5 9.1538 5 9.32912C5 9.50445 5.03471 9.67803 5.10214 9.83987C5.16956 10.0017 5.26836 10.1486 5.39284 10.2721L11.0239 15.9031C11.1473 16.0276 11.2942 16.1264 11.4561 16.1938C11.6179 16.2612 11.7915 16.2959 11.9668 16.2959C12.1421 16.2959 12.3157 16.2612 12.4775 16.1938C12.6394 16.1264 12.7863 16.0276 12.9097 15.9031L18.6072 10.2721C18.7316 10.1486 18.8304 10.0017 18.8979 9.83987C18.9653 9.67803 19 9.50445 19 9.32912C19 9.1538 18.9653 8.98022 18.8979 8.81838C18.8304 8.65654 18.7316 8.50965 18.6072 8.38619Z"/></svg>';

  // Ordinal rank table for sankey node labels. Used to:
  //   (a) sort group colour assignment so e.g. "High" always gets the
  //       darkest sequential shade regardless of where it appears in the
  //       data, and
  //   (b) drive d3-sankey's nodeSort so the same vocabulary stacks
  //       top-to-bottom by rank in every column.
  // Lower number = higher priority (= darker colour, = higher in column).
  // Labels not present here fall back to encounter order.
  //
  // Currently covers MDPR Delivery Confidence Assessment ratings. Extend
  // here when other ordinal vocabularies appear (project lifecycle states,
  // likert scales, RAG statuses, etc.) - the entries are matched case-
  // insensitively after trimming and collapsing internal whitespace.
  const ORDINAL_RANK = {
    high: 0,
    'medium-high': 1,
    medium: 2,
    'medium-low': 3,
    low: 4,
    'not reported': 5,
    'not-reported': 5,
    'unable to rate': 6,
  };

  function rankOf(label) {
    if (!label) return null;
    const k = String(label).toLowerCase().trim().replace(/\s+/g, ' ');
    return Object.prototype.hasOwnProperty.call(ORDINAL_RANK, k) ? ORDINAL_RANK[k] : null;
  }

  /**
   * Sort comparator for groups identified by their label string. Ranked
   * labels sort by rank ascending; unranked labels keep encounter order
   * (stable sort, returning 0). Mixed pairs put ranked labels first so
   * the colour ramp starts on the known ordinal.
   */
  function compareByRank(a, b) {
    const ra = rankOf(a);
    const rb = rankOf(b);
    if (ra !== null && rb !== null) return ra - rb;
    if (ra !== null) return -1;
    if (rb !== null) return 1;
    return 0;
  }

  // digital.gov.au data-vis categorical palette (light) - the navy-anchored ONS
  // set, mirroring the --dga-data-vis-categorical-* tokens in chart.scss. Six
  // fixed, CVD-tuned colours; series past 6 cycle the set (forcing texture
  // beyond 6, so the repeats stay distinguishable, is still to be wired). This
  // is the no-CSS fallback; .ct-theme-dark .bdga-chart in chart.css overrides.
  //
  // The CSS-variable hook (--bdga-chart-c1..c14, --bdga-chart-s1..s6) lets a
  // consumer swap palettes without touching this file.
  const PALETTE_DEFAULT = [
    '#1e3c50', // navy (primary, anchor) - series 1
    '#28a197', // turquoise
    '#801650', // dark pink
    '#f46a25', // orange
    '#a285d1', // light purple
    '#3d3d3d', // dark grey
    '#1e3c50', '#28a197', '#801650', '#f46a25', '#a285d1', '#3d3d3d', // 7-12: cycle
    '#1e3c50', '#28a197', // 13-14: cycle
  ];
  // Sequential navy ramp (digital.gov.au), darkest -> pale grey, mirroring the
  // --bdga-chart-s* tokens in chart.scss. Drives ordinal colouring (sankey/flow
  // node ranks) and overflow shades for many-series charts. OKLCH-tuned steps;
  // s6 is the no-data pale grey. Dark theme overrides via CSS.
  const SEQUENTIAL_DEFAULT = ['#001d33', '#003c61', '#015e8c', '#5693bd', '#aed0e8', '#f0eeee'];

  /**
   * Resolve a CSS custom property against a DOM element, with fallback.
   * Empty / undefined values fall back to the default so authors can leave
   * gaps in their override (e.g. only override c1 and c2).
   */
  function cssVar(el, name, fallback) {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v !== '' ? v : fallback;
  }

  /**
   * Numeric variant of cssVar: read a length-like custom property and parse
   * its leading number (px). Used for the responsive layout knobs that the
   * @container queries in chart.scss switch by container width. Returns the
   * fallback when the property is unset or non-numeric.
   */
  function cssNum(el, name, fallback) {
    const n = parseFloat(getComputedStyle(el).getPropertyValue(name));
    return Number.isFinite(n) ? n : fallback;
  }

  /**
   * Read the 14 categorical and 6 sequential colour stops from CSS on the
   * given chart element. Computed once per chart at draw time.
   */
  function resolvePalette(el) {
    const categorical = PALETTE_DEFAULT.map((d, i) => cssVar(el, `--bdga-chart-c${  i + 1}`, d));
    const sequential = SEQUENTIAL_DEFAULT.map((d, i) => cssVar(el, `--bdga-chart-s${  i + 1}`, d));
    return { categorical, sequential, single: categorical[0] };
  }

  function shadeSequential(palette, index, total) {
    if (total <= 1) return palette.single;
    return palette.sequential[Math.min(index, palette.sequential.length - 1)];
  }

  Drupal.behaviors.bdgaChart = {
    attach(context) {
      if (typeof window.d3 === 'undefined') {
        // D3 vendored library not loaded; keep the table fallback.
        return;
      }
      once('bdga-chart', '[data-bdga-chart]', context).forEach((el) => {
        // eslint-disable-next-line no-use-before-define
        new BdgaChart(el).init();
      });
    },
  };

  class BdgaChart {
    constructor(root) {
      this.root = root;
      this.canvas = root.querySelector('[data-bdga-chart-canvas]');
      this.errorEl = root.querySelector('[data-bdga-chart-error]');
      this.tableEl = root.querySelector('[data-bdga-chart-data]');
      this.statusEl = root.querySelector('[data-bdga-chart-status]');
      this.configEl = root.querySelector('script[type="application/json"][data-bdga-chart-config]');

      // Read primary config from the JSON data island. Fall back to data-*
      // attributes + table walk only if the island isn't present (e.g. an
      // older cached render of the markup, or a hand-rolled embed).
      const config = this.readConfig();
      if (config) {
        this.id = config.id || root.id || null;
        this.type = config.type || root.dataset.bdgaChart || 'bar';
        this.mode = config.source || 'json';
        this.url = config.url || null;
        this.xKey = config.x_key || null;
        this.yKeys = Array.isArray(config.y_keys) ? config.y_keys.slice() : [];
        this.rows = Array.isArray(config.rows) ? config.rows : [];
        this.locale = config.locale || null;
        this.maxRows = config.max_rows || MAX_ROWS;
        this.xLabel = config.x_label || this.xKey;
        this.yLabel = config.y_label || (this.yKeys.length === 1 ? this.yKeys[0] : '');
        // 'series' | 'category' | 'single' | a row field name to colour by.
        // Passed through verbatim; the renderers interpret it (no auto-detect).
        this.colorBy = config.color_by || 'series';
        // Sankey / flow shape - parallel to rows. drawSankey / drawFlow
        // ignore rows entirely and read these instead.
        this.nodes = Array.isArray(config.nodes) ? config.nodes : null;
        this.links = Array.isArray(config.links) ? config.links : null;
        // Lollipop median reference line; null disables.
        this.medianValue = (typeof config.median_value === 'number' && Number.isFinite(config.median_value))
          ? config.median_value
          : null;
        this.filters = Array.isArray(config.filters) ? config.filters : [];
      }
      else {
        this.id = root.dataset.bdgaChartId;
        this.type = root.dataset.bdgaChart;
        this.mode = root.dataset.bdgaChartSource;
        this.url = root.dataset.bdgaChartUrl || null;
        this.xKey = root.dataset.bdgaChartX || null;
        this.yKeys = (root.dataset.bdgaChartY || '').split(',').filter(Boolean);
        this.rows = null;
        this.locale = null;
        this.maxRows = MAX_ROWS;
        this.xLabel = this.xKey;
        this.yLabel = this.yKeys[0] || '';
        this.colorBy = 'series';
        this.nodes = null;
        this.links = null;
        this.medianValue = null;
        this.filters = [];
      }

      // Toolbar (optional, Phase 1). References resolve to null when the
      // `toolbar` prop didn't render the markup, in which case initToolbar()
      // is a no-op. downloads is read from the figure's data-* attribute so
      // it works in Storybook and Drupal alike, independent of config_json.
      this.toolbarEl = root.querySelector('[data-bdga-chart-toolbar]');
      this.menuEl = root.querySelector('[data-bdga-chart-menu]');
      this.menuButtonEl = root.querySelector('[data-bdga-chart-menu-button]');
      this.tableToggleEl = root.querySelector('[data-bdga-chart-tool="table"]');
      this.detailsEl = this.tableEl ? this.tableEl.closest('details') : null;
      this.downloads = (root.dataset.bdgaChartDownloads || '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s === 'csv' || s === 'json');
      // Optional human-readable source page for url mode. When present, the
      // "View source" link targets this instead of the raw data endpoint
      // (this.url). Read from the data-* attribute for Storybook/Drupal parity.
      this.sourcePage = root.dataset.bdgaChartSourcePage || null;
      this.menuOpen = false;
      this.menuItems = [];

      // Legend (optional, Phase 2). Series toggled here are tracked in
      // `hidden` (by y-key, or by x-value for pie) and excluded at draw time.
      this.legendEl = root.querySelector('[data-bdga-chart-legend]');
      this.legendBuilt = false;
      this.legendButtons = new Map();
      this.hidden = new Set();

      // Texture fills (optional, Phase 4): SVG pattern fills layered on the
      // series colour as a colour-blind-safe redundant cue.
      this.texture = root.dataset.bdgaChartTexture === 'true';

      // Zoom (optional, Phase 4): data-domain windowing for the ordinal
      // cartesian types. zoomWindow is an inclusive {start, end} index range
      // into the full ordered data; null = full extent.
      this.zoomGroupEl = root.querySelector('[data-bdga-chart-zoom-group]');
      this.zoom = !!this.zoomGroupEl;
      this.zoomWindow = null;

      // Filters (optional): author-declared client-side filter controls, built
      // into the filter bar by setupFilters() on first draw. The full dataset
      // is kept in fullRows so re-filtering always restarts from complete.
      this.filtersBarEl = root.querySelector('[data-bdga-chart-filters-bar]');
      this.activeFilters = new Map();
      this.fullRows = null;
    }

    /**
     * Parse the JSON data island. Returns null if absent or unparseable.
     * Failures here are silent at the constructor level; init() decides
     * whether to fall back to the table or fail loudly.
     */
    readConfig() {
      if (!this.configEl) return null;
      try {
        const txt = this.configEl.textContent || '';
        if (!txt.trim()) return null;
        return JSON.parse(txt);
      }
      catch (e) {
        if (window.console) {
          window.console.warn('[bdga-chart] config JSON parse failed:', e);
        }
        return null;
      }
    }

    init() {
      this.observeResize();
      this.initToolbar();
      try {
        if (this.mode === 'url') {
          return this.loadFromUrl();
        }
        // Sankey / flow read nodes + links from the JSON island; the table
        // is the AT fallback only, not a data source for the renderer.
        if (this.type === 'sankey' || this.type === 'flow') {
          if (!this.nodes || !this.nodes.length || !this.links || !this.links.length) {
            return this.fail('Sankey/flow chart requires nodes and links');
          }
          if (typeof window.d3 === 'undefined' || typeof window.d3.sankey !== 'function') {
            return this.fail('d3-sankey plugin missing');
          }
          return this.draw([]);
        }
        // Prefer rows from the JSON island; only walk the <table> if we
        // didn't get any (older markup, or a hand-rolled embed).
        let rows = this.rows;
        if (!rows || !rows.length) {
          rows = this.readTable();
        }
        if (!rows.length) return this.fail('No rows in data island or fallback table');
        this.fullRows = rows;
        this.setupFilters();
        this.drawFiltered();
      } catch (err) {
        this.fail(err && err.message ? err.message : String(err));
      }
    }

    /**
     * Re-lay-out the chart when its container width changes (device rotation,
     * responsive sidebar, Storybook viewport switch). The SVG already CSS-
     * scales via its viewBox, but re-running the draw at the new pixel width
     * keeps tick text, stroke widths and the sankey @container margin knobs
     * crisp and correct. No-op until the first successful draw has stored its
     * inputs, and a no-op on browsers without ResizeObserver.
     */
    observeResize() {
      if (typeof ResizeObserver === 'undefined' || this.resizeObserver || !this.canvas) {
        return;
      }
      let timer = 0;
      this.resizeObserver = new ResizeObserver(() => {
        // Debounce a burst of resize callbacks (e.g. during a drag) into one
        // redraw once the width settles. setTimeout (not rAF) so the redraw
        // still lands when the chart is in a backgrounded / hidden tab, where
        // rAF is paused.
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          if (this.lastDrawData === undefined) return;
          const w = this.canvas.clientWidth || 0;
          // Ignore sub-pixel jitter and the observer's own initial callback
          // (same width as the last draw) so a redraw can't feed itself.
          if (Math.abs(w - (this.lastDrawWidth || 0)) <= 2) return;
          this.redraw();
        }, 150);
      });
      this.resizeObserver.observe(this.canvas);
    }

    redraw() {
      try {
        this.draw(this.lastDrawData || []);
      } catch {
        // Keep the last good render rather than blanking the canvas on a
        // transient resize-time error.
      }
    }

    setStatus(msg) {
      if (this.statusEl) this.statusEl.textContent = msg;
    }

    fail(reason) {
      if (window.console) {
        window.console.warn(`[bdga-chart] ${  this.id  }: ${  reason}`);
      }
      if (this.errorEl) this.errorEl.hidden = false;
      if (this.canvas) this.canvas.setAttribute('aria-hidden', 'true');
      this.setStatus(Drupal.t('Chart unavailable.'));
    }

    // -- Toolbar (Phase 1) ---------------------------------------------------
    //
    // Accessible controls layered on top of the table-first markup. The
    // "View as table" button drives the existing data disclosure; the overflow
    // menu offers a source-aware action set (download links for local data, a
    // "view source" link in url mode) using the WAI-ARIA menu-button keyboard
    // model. The menu items are built here, not server-side, because their
    // payload derives from the live data the renderer holds; no-JS users keep
    // the table (its own <summary> still works) and the url-mode <noscript>.

    initToolbar() {
      if (!this.toolbarEl) return;
      this.wireTableToggle();
      this.buildMenu();
      this.wireMenu();
      this.wireZoom();
    }

    wireZoom() {
      if (!this.zoomGroupEl) return;
      this.zoomGroupEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-bdga-chart-zoom]');
        if (!btn) return;
        const action = btn.getAttribute('data-bdga-chart-zoom');
        // Centre on the last-focused data point when there is one (clicking the
        // button moved focus off it, but focusPos still records where it was);
        // otherwise centre on the current window.
        const center = this.pointFocused ? this.currentFullIndex() : null;
        if (action === 'in') this.zoomIn(center);
        else if (action === 'out') this.zoomOut(center);
        else this.zoomReset();
      });
    }

    applicableZoom() {
      return this.zoom && (this.type === 'bar' || this.type === 'line' || this.type === 'lollipop');
    }

    sliceZoom(rows) {
      if (!this.zoomWindow) return rows;
      return rows.slice(this.zoomWindow.start, this.zoomWindow.end + 1);
    }

    /** Full-data index of the focused point, for +/- zoom. */
    currentFullIndex() {
      const base = this.zoomWindow ? this.zoomWindow.start : 0;
      return base + (this.focusPos ? this.focusPos.i : 0);
    }

    /**
     * Re-window around a centre index. factor < 1 zooms in, > 1 zooms out.
     * Clamps to >= 2 points and to the data bounds; a window covering the whole
     * range resets to null (full extent). When refocus is set (key-driven
     * zoom), keyboard focus is restored to the SAME data point it centred on -
     * not the first point - so the user keeps their place across the redraw.
     */
    zoomBy(factor, centerIdx, refocus) {
      const rows = this.lastDrawData || [];
      const n = rows.length;
      if (n < 3) return;
      // Capture the focused point's identity (series group + full-data index)
      // before the redraw rebuilds the point model.
      const g = this.focusPos ? this.focusPos.g : 0;
      const win = this.zoomWindow || { start: 0, end: n - 1 };
      const span = win.end - win.start + 1;
      const newSpan = Math.max(2, Math.round(span * factor));
      if (newSpan >= n) {
        this.zoomWindow = null;
      }
      else {
        const center = centerIdx != null ? centerIdx : Math.floor((win.start + win.end) / 2);
        let start = Math.round(center - newSpan / 2);
        start = Math.max(0, Math.min(start, n - newSpan));
        this.zoomWindow = { start, end: start + newSpan - 1 };
      }
      this.redraw();
      this.announceZoom();
      if (refocus) this.refocusPoint(g, centerIdx);
    }

    zoomIn(centerIdx, refocus) {
      this.zoomBy(0.6, centerIdx, refocus);
    }

    zoomOut(centerIdx, refocus) {
      this.zoomBy(1.8, centerIdx, refocus);
    }

    zoomReset(centerIdx, refocus) {
      const g = this.focusPos ? this.focusPos.g : 0;
      this.zoomWindow = null;
      this.redraw();
      this.announceZoom();
      if (refocus) this.refocusPoint(g, centerIdx);
    }

    /**
     * Restore keyboard focus to the data point with the given full-data index
     * within series group g, after a zoom rebuilt the point model. The centred
     * point is always still in the window, so this keeps the user on it;
     * clamps if the group is shorter than expected.
     */
    refocusPoint(g, fullIdx) {
      if (!this.pointGroups.length) return;
      const gi = Math.min(g, this.pointGroups.length - 1);
      const group = this.pointGroups[gi];
      if (!group || !group.length) return;
      const base = this.zoomWindow ? this.zoomWindow.start : 0;
      let i = fullIdx == null ? 0 : fullIdx - base;
      i = Math.max(0, Math.min(i, group.length - 1));
      this.focusPoint(gi, i);
    }

    announceZoom() {
      const rows = this.lastDrawData || [];
      if (!this.zoomWindow) {
        this.setStatus(Drupal.t('Showing all @n points.', { '@n': rows.length }));
        return;
      }
      const { start, end } = this.zoomWindow;
      this.setStatus(
        Drupal.t('Showing @a to @b, @c of @n points.', {
          '@a': rows[start] ? rows[start][this.xKey] : '',
          '@b': rows[end] ? rows[end][this.xKey] : '',
          '@c': end - start + 1,
          '@n': rows.length,
        })
      );
    }

    wireTableToggle() {
      const btn = this.tableToggleEl;
      const details = this.detailsEl;
      if (!btn || !details) return;
      btn.addEventListener('click', () => {
        details.open = !details.open;
        if (details.open) {
          const summary = details.querySelector('summary');
          if (summary) summary.focus();
          this.setStatus(Drupal.t('Showing data table.'));
        }
      });
      // Mirror the button's state when the disclosure is toggled directly via
      // its native summary, so the two controls never disagree.
      const sync = () => btn.setAttribute('aria-expanded', String(details.open));
      details.addEventListener('toggle', sync);
      sync();
    }

    /**
     * Build the overflow menu's items. url mode offers a single "view source"
     * link; local modes offer a download button per configured format. When
     * there is nothing to offer, the menu button is removed so we never ship
     * an empty menu.
     */
    buildMenu() {
      const menu = this.menuEl;
      if (!menu) return;
      const items = [];

      if (this.mode === 'url' && (this.sourcePage || this.url)) {
        const a = document.createElement('a');
        a.className = 'bdga-chart__menu-item';
        a.setAttribute('role', 'menuitem');
        // Landing page when resolved, else the raw data endpoint.
        a.href = this.sourcePage || this.url;
        // Same-tab by design - don't force a new tab (WCAG 3.2.5).
        a.textContent = Drupal.t('View source data');
        a.addEventListener('click', () => this.closeMenu(false));
        items.push(a);
      }
      else {
        this.downloads.forEach((fmt) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'bdga-chart__menu-item';
          b.setAttribute('role', 'menuitem');
          b.textContent = fmt === 'json'
            ? Drupal.t('Download data (JSON)')
            : Drupal.t('Download data (CSV)');
          b.addEventListener('click', () => {
            this.download(fmt);
            this.closeMenu(true);
          });
          items.push(b);
        });
      }

      // Image exports capture the rendered SVG, not the source data, so they
      // are offered in every source mode (including url mode).
      items.push(
        this.imageMenuItem(Drupal.t('Download image (PNG)'), () => this.downloadPng()),
        this.imageMenuItem(Drupal.t('Download image (SVG)'), () => this.downloadSvg()),
      );

      if (!items.length) {
        const wrap = this.menuButtonEl && this.menuButtonEl.closest('.bdga-chart__menu-wrap');
        if (wrap) wrap.remove();
        this.menuButtonEl = null;
        this.menuEl = null;
        return;
      }

      menu.replaceChildren(
        ...items.map((el) => {
          const li = document.createElement('li');
          li.setAttribute('role', 'none');
          li.appendChild(el);
          return li;
        })
      );
      this.menuItems = items;
      items.forEach((el, i) => el.setAttribute('tabindex', i === 0 ? '0' : '-1'));
    }

    wireMenu() {
      const button = this.menuButtonEl;
      const menu = this.menuEl;
      if (!button || !menu || !this.menuItems.length) return;

      button.addEventListener('click', () => {
        if (this.menuOpen) this.closeMenu(true);
        else this.openMenu(0);
      });
      button.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openMenu(0);
        }
        else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.openMenu(this.menuItems.length - 1);
        }
      });

      menu.addEventListener('keydown', (e) => {
        const items = this.menuItems;
        const current = items.indexOf(document.activeElement);
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            this.focusMenuItem((current + 1) % items.length);
            break;
          case 'ArrowUp':
            e.preventDefault();
            this.focusMenuItem((current - 1 + items.length) % items.length);
            break;
          case 'Home':
            e.preventDefault();
            this.focusMenuItem(0);
            break;
          case 'End':
            e.preventDefault();
            this.focusMenuItem(items.length - 1);
            break;
          case 'Escape':
            e.preventDefault();
            this.closeMenu(true);
            break;
          case 'Tab':
            // Let focus leave naturally, but collapse the menu behind it.
            this.closeMenu(false);
            break;
          default:
            break;
        }
      });

      // Dismiss on any pointer interaction outside the toolbar while open.
      document.addEventListener('pointerdown', (e) => {
        if (!this.menuOpen) return;
        if (this.toolbarEl && this.toolbarEl.contains(e.target)) return;
        this.closeMenu(false);
      });
    }

    openMenu(index) {
      if (!this.menuEl || !this.menuButtonEl) return;
      this.menuEl.hidden = false;
      this.menuButtonEl.setAttribute('aria-expanded', 'true');
      this.menuOpen = true;
      this.focusMenuItem(index);
    }

    closeMenu(returnFocus) {
      if (!this.menuEl || !this.menuButtonEl) return;
      this.menuEl.hidden = true;
      this.menuButtonEl.setAttribute('aria-expanded', 'false');
      this.menuOpen = false;
      if (returnFocus) this.menuButtonEl.focus();
    }

    focusMenuItem(index) {
      const items = this.menuItems;
      items.forEach((el, i) => el.setAttribute('tabindex', i === index ? '0' : '-1'));
      if (items[index]) items[index].focus();
    }

    /**
     * Trigger a client-side download of the current data in the given format.
     * Reads the live data at click time so url-mode charts export whatever has
     * loaded; announces the outcome through the status live region.
     */
    download(fmt) {
      const rows = this.exportRows();
      if (!rows.length) {
        this.setStatus(Drupal.t('No data available to download yet.'));
        return;
      }
      const base = this.exportBase();
      const info = this.exportSource();
      if (fmt === 'json') {
        // Envelope the rows with provenance. `rows` is kept as the data key so
        // the file round-trips through the chart's own JSON parser.
        const payload = { source: this.exportSourceMeta(info), rows };
        this.downloadBlob(`${base}.json`, 'application/json', JSON.stringify(payload, null, 2));
        this.setStatus(Drupal.t('Data downloaded as JSON.'));
      }
      else {
        this.downloadBlob(`${base}.csv`, 'text/csv;charset=utf-8', this.exportSourceComment(info) + this.toCsv(rows));
        this.setStatus(Drupal.t('Data downloaded as CSV.'));
      }
    }

    /** Provenance object for the JSON export envelope. */
    exportSourceMeta(info) {
      const src = info || this.exportSource();
      const meta = { title: src.title, retrieved: src.retrieved };
      const url = src.landing || src.sourceUrl;
      if (url) meta.url = url;
      if (src.publisher) meta.publisher = src.publisher;
      return meta;
    }

    /**
     * Leading comment lines for the CSV export carrying the same source line as
     * the image exports. CSV has no metadata standard; `#` comments are the
     * common convention (pandas/csvkit honour `comment='#'`).
     */
    exportSourceComment(info) {
      const src = info || this.exportSource();
      const url = src.landing || src.sourceUrl;
      const lines = url
        ? [`# Source: ${url} (${src.publisher || 'source'})`, `# Retrieved: ${src.retrieved.slice(0, 10)}`]
        : [`# ${src.title}`, `# Generated: ${src.retrieved.slice(0, 10)}`];
      return `${lines.join('\r\n')}\r\n`;
    }

    /**
     * The rows to export. Flow / sankey carry their data as links
     * (source / target / value); every other type exports the plotted rows.
     * Falls back to the parsed table when no draw has happened yet.
     */
    exportRows() {
      if ((this.type === 'sankey' || this.type === 'flow') && Array.isArray(this.links)) {
        return this.links.map((l) => ({
          source: l.source && l.source.id ? l.source.id : l.source,
          target: l.target && l.target.id ? l.target.id : l.target,
          value: l.value,
        }));
      }
      if (Array.isArray(this.lastDrawData) && this.lastDrawData.length) {
        return this.lastDrawData;
      }
      if (Array.isArray(this.rows) && this.rows.length) return this.rows;
      return this.readTable();
    }

    /**
     * Columns to emit, in a stable order: X key then the Y series for normal
     * charts, the fixed triplet for flow charts, or the first row's own keys
     * as a last resort.
     */
    csvColumns(rows) {
      if (this.type === 'sankey' || this.type === 'flow') {
        return ['source', 'target', 'value'];
      }
      const cols = [];
      if (this.xKey) cols.push(this.xKey);
      (this.yKeys || []).forEach((k) => {
        if (cols.indexOf(k) === -1) cols.push(k);
      });
      if (!cols.length && rows[0]) return Object.keys(rows[0]);
      return cols;
    }

    toCsv(rows) {
      const keys = this.csvColumns(rows);
      const esc = (v) => {
        const s = v === null || v === undefined ? '' : String(v);
        return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const head = keys.map(esc).join(',');
      const body = rows.map((r) => keys.map((k) => esc(r[k])).join(',')).join('\r\n');
      return `${head}\r\n${body}\r\n`;
    }

    saveBlob(filename, blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoke on the next tick, once the download navigation has started.
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    }

    downloadBlob(filename, mime, text) {
      this.saveBlob(filename, new Blob([text], { type: mime }));
    }

    // -- Image export (PNG / SVG) --------------------------------------------
    //
    // Capture the rendered <svg> as a standalone file. Both work in every
    // source mode because they read the drawn chart, not the source data.

    /** A menu-item button wired to an image-export action. */
    imageMenuItem(label, action) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'bdga-chart__menu-item';
      b.setAttribute('role', 'menuitem');
      b.textContent = label;
      b.addEventListener('click', () => {
        action();
        this.closeMenu(true);
      });
      return b;
    }

    /** The rendered <svg>, or null before the first draw. */
    chartSvg() {
      return this.canvas ? this.canvas.querySelector('svg') : null;
    }

    /** Filename stem shared by every export. */
    exportBase() {
      return String(this.id || 'chart').replace(/[^\w-]+/g, '-');
    }

    /** Opaque backdrop for the PNG - SVG areas are otherwise transparent. */
    exportBackground() {
      const probe = this.root || this.canvas;
      if (probe) {
        const bg = window.getComputedStyle(probe).backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') return bg;
      }
      const dark = this.root && this.root.classList.contains('ct-theme-dark');
      return dark ? '#000000' : '#ffffff';
    }

    /**
     * Copy presentation-affecting computed styles from the live SVG subtree
     * onto its detached clone, recursing in lockstep. The on-page chart leans
     * on external CSS + --bdga-chart-* custom properties; inlining makes the
     * serialised copy self-contained.
     */
    inlineSvgStyles(srcEl, cloneEl) {
      const cs = window.getComputedStyle(srcEl);
      let decl = '';
      EXPORT_STYLE_PROPS.forEach((prop) => {
        const val = cs.getPropertyValue(prop);
        if (val) decl += `${prop}:${val};`;
      });
      if (decl) cloneEl.setAttribute('style', decl);
      const src = srcEl.children;
      const clone = cloneEl.children;
      for (let i = 0; i < src.length; i += 1) {
        if (clone[i]) this.inlineSvgStyles(src[i], clone[i]);
      }
    }

    /** Clip a string to n chars with an ellipsis, for the visible caption. */
    clip(str, n) {
      const s = String(str);
      return s.length > n ? `${s.slice(0, n - 1)}…` : s;
    }

    /**
     * Provenance for the export: chart title, the data source (landing page
     * preferred over the raw endpoint), publisher host, and a retrieval
     * timestamp. Only url-mode charts have an external source; local data
     * yields title + date only.
     */
    exportSource() {
      const titleEl = this.root && this.root.querySelector('.bdga-chart__title');
      const title = (titleEl && titleEl.textContent.trim()) || this.id || 'Chart';
      let sourceUrl = '';
      let landing = '';
      let publisher = '';
      if (this.mode === 'url') {
        sourceUrl = this.url || '';
        landing = this.sourcePage || '';
        const probe = landing || sourceUrl;
        if (probe) {
          try { publisher = new URL(probe).hostname.replace(/^www\./, ''); } catch { /* leave empty */ }
        }
      }
      return { title, sourceUrl, landing, publisher, retrieved: new Date().toISOString() };
    }

    /**
     * Inject SVG provenance into the export clone (no effect on the live
     * chart): a <title> + <desc> for assistive tech, and a Dublin Core
     * <metadata> block (dc:title, dc:source, dc:publisher, dc:date) for
     * machine-readable attribution. Source / publisher are emitted only for
     * url-mode data.
     */
    injectProvenance(svg, info) {
      const SVGNS = 'http://www.w3.org/2000/svg';
      const RDFNS = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
      const DCNS = 'http://purl.org/dc/elements/1.1/';
      const sourceText = info.landing || info.sourceUrl;

      const title = document.createElementNS(SVGNS, 'title');
      title.textContent = info.title;
      const desc = document.createElementNS(SVGNS, 'desc');
      desc.textContent = sourceText
        ? `${info.title}. Source: ${sourceText} (${info.publisher || 'source'}), retrieved ${info.retrieved.slice(0, 10)}.`
        : `${info.title}. Generated ${info.retrieved.slice(0, 10)}.`;

      const metadata = document.createElementNS(SVGNS, 'metadata');
      const rdf = document.createElementNS(RDFNS, 'rdf:RDF');
      const description = document.createElementNS(RDFNS, 'rdf:Description');
      const dc = (local, value) => {
        if (!value) return;
        const el = document.createElementNS(DCNS, `dc:${local}`);
        el.textContent = value;
        description.appendChild(el);
      };
      dc('title', info.title);
      dc('source', sourceText);
      dc('publisher', info.publisher);
      dc('date', info.retrieved);
      rdf.appendChild(description);
      metadata.appendChild(rdf);

      // <title> first (accessible name), then <desc>, then <metadata>.
      svg.insertBefore(metadata, svg.firstChild);
      svg.insertBefore(desc, metadata);
      svg.insertBefore(title, desc);
    }

    /**
     * Serialise the live <svg> into a standalone, portable string: inline the
     * computed styles (so it renders without the page CSS), add a Dublin Core
     * <metadata> block + <title>/<desc>, and - when the data has a source -
     * bake a "Source:" caption into an added bottom band so the attribution
     * survives PNG rasterisation too. Returns { string, width, height } or null
     * when nothing has been drawn yet.
     */
    serializeSvg() {
      const svgEl = this.chartSvg();
      if (!svgEl) return null;
      const rect = svgEl.getBoundingClientRect();
      const vb = svgEl.viewBox && svgEl.viewBox.baseVal;
      const baseW = Math.round((vb && vb.width) || rect.width || 600);
      const baseH = Math.round((vb && vb.height) || rect.height || 400);

      const clone = svgEl.cloneNode(true);
      // Inline styles BEFORE adding export-only nodes, so the lockstep walk
      // with the live tree stays index-aligned.
      this.inlineSvgStyles(svgEl, clone);

      const info = this.exportSource();
      const caption = info.landing || info.publisher || info.sourceUrl;
      let height = baseH;

      if (caption) {
        // Grow a bottom band for a baked source line - the only attribution
        // that survives PNG rasterisation (metadata / desc do not).
        const band = 22;
        height = baseH + band;
        clone.setAttribute('viewBox', `0 0 ${baseW} ${height}`);
        const dark = this.root && this.root.classList.contains('ct-theme-dark');
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '8');
        text.setAttribute('y', String(height - 7));
        text.setAttribute('style', `font-family:Arial,Helvetica,sans-serif;font-size:12px;fill:${dark ? '#cfcfcf' : '#5a5a5a'};`);
        text.textContent = `Source: ${this.clip(caption, 96)}  ·  Retrieved ${info.retrieved.slice(0, 10)}`;
        clone.appendChild(text);
      }

      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      clone.setAttribute('width', String(baseW));
      clone.setAttribute('height', String(height));
      this.injectProvenance(clone, info);

      const string = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${new XMLSerializer().serializeToString(clone)}`;
      return { string, width: baseW, height };
    }

    downloadSvg() {
      const out = this.serializeSvg();
      if (!out) {
        this.setStatus(Drupal.t('No chart available to download yet.'));
        return;
      }
      this.downloadBlob(`${this.exportBase()}.svg`, 'image/svg+xml;charset=utf-8', out.string);
      this.setStatus(Drupal.t('Chart downloaded as SVG.'));
    }

    downloadPng() {
      const out = this.serializeSvg();
      if (!out) {
        this.setStatus(Drupal.t('No chart available to download yet.'));
        return;
      }
      const scale = window.devicePixelRatio || 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(out.width * scale));
      canvas.height = Math.max(1, Math.round(out.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        this.setStatus(Drupal.t('PNG export is not supported in this browser.'));
        return;
      }
      ctx.scale(scale, scale);
      ctx.fillStyle = this.exportBackground();
      ctx.fillRect(0, 0, out.width, out.height);
      const svgUrl = URL.createObjectURL(new Blob([out.string], { type: 'image/svg+xml;charset=utf-8' }));
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, out.width, out.height);
        URL.revokeObjectURL(svgUrl);
        canvas.toBlob((blob) => {
          if (!blob) {
            this.setStatus(Drupal.t('PNG export failed.'));
            return;
          }
          this.saveBlob(`${this.exportBase()}.png`, blob);
          this.setStatus(Drupal.t('Chart downloaded as PNG.'));
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        this.setStatus(Drupal.t('PNG export failed.'));
      };
      img.src = svgUrl;
    }

    // -- Legend + series toggle (Phase 2) ------------------------------------
    //
    // An interactive legend for the genuinely multi-series renderers
    // (grouped_bar, stacked_bar, pie). Each item is an aria-pressed toggle
    // button: pressed = shown. Hover or focus highlights that series (others
    // drop to 30% opacity, per Carbon); click hides/shows it and redraws.
    // Hidden state carries a non-colour cue (strike-through + "(hidden)" in the
    // accessible name) so it never relies on colour alone (WCAG 1.4.1). The
    // legend is an enhancement: the chart still renders, and the data table
    // still carries every series, when it is absent.

    /** Y-keys not currently hidden. Renderers iterate this, not this.yKeys. */
    visibleKeys() {
      return this.yKeys.filter((k) => !this.hidden.has(k));
    }

    /** Count of series still visible, across the keyed and pie shapes. */
    visibleSeriesCount() {
      if (this.type === 'pie') {
        return (this.lastDrawData || []).filter(
          (r) => !this.hidden.has(String(r[this.xKey]))
        ).length;
      }
      return this.visibleKeys().length;
    }

    /**
     * Stable colour for a series at its ORIGINAL index, so a series keeps its
     * colour when others are toggled off. Mirrors the categorical / sequential
     * policy used by the renderers.
     */
    seriesColor(index, total) {
      const p = this.palette || resolvePalette(this.root);
      return total <= p.categorical.length
        ? p.categorical[index]
        : shadeSequential(p, index, total);
    }

    /**
     * Fill value for a series mark: the flat colour, or - when texture is on -
     * an SVG pattern that layers a motif over that colour. The pattern keeps
     * the series colour as its background, so colour and texture agree and the
     * texture is a redundant cue, not a replacement (WCAG 1.4.1).
     */
    fillFor(svg, index, color) {
      return this.texture ? this.ensurePattern(svg, index, color) : color;
    }

    /**
     * Lazily define one pattern per series index in the svg's <defs>, cycling
     * through five motifs (two hatches, dots, cross-hatch, vertical). Returns
     * the url() reference. Motifs are deliberately subtle white-on-colour so
     * they read as texture without the clutter Carbon and UK Gov warn about.
     */
    ensurePattern(svg, index, color) {
      const id = `bdga-pat-${this.id || 'chart'}-${index}`.replace(/[^\w-]+/g, '-');
      let defs = svg.select('defs');
      if (defs.empty()) defs = svg.append('defs');
      if (this.patternIds.has(id)) return `url(#${id})`;
      this.patternIds.add(id);

      const motif = index % 5;
      const stroke = 'rgba(255, 255, 255, 0.7)';
      const sw = 1.3;
      const p = defs
        .append('pattern')
        .attr('id', id)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 8)
        .attr('height', 8);
      p.append('rect').attr('width', 8).attr('height', 8).attr('fill', color);
      const hline = (yy) =>
        p.append('line').attr('x1', 0).attr('y1', yy).attr('x2', 8).attr('y2', yy)
          .attr('stroke', stroke).attr('stroke-width', sw);
      const vline = (xx) =>
        p.append('line').attr('x1', xx).attr('y1', 0).attr('x2', xx).attr('y2', 8)
          .attr('stroke', stroke).attr('stroke-width', sw);
      if (motif === 0) {
        hline(2); hline(6); p.attr('patternTransform', 'rotate(45)');
      }
      else if (motif === 1) {
        hline(2); hline(6); p.attr('patternTransform', 'rotate(-45)');
      }
      else if (motif === 2) {
        p.append('circle').attr('cx', 4).attr('cy', 4).attr('r', 1.5).attr('fill', stroke);
      }
      else if (motif === 3) {
        hline(4); vline(4);
      }
      else {
        vline(2); vline(6);
      }
      return `url(#${id})`;
    }

    buildLegend() {
      if (!this.legendEl || this.legendBuilt) return;
      this.palette = this.palette || resolvePalette(this.root);
      let series;
      if (this.type === 'pie') {
        const rows = this.lastDrawData || [];
        series = rows.map((r, i) => ({
          key: String(r[this.xKey]),
          label: String(r[this.xKey]),
          color: this.seriesColor(i, rows.length),
        }));
      }
      else {
        series = this.yKeys.map((k, i) => ({
          key: String(k),
          label: String(k),
          color: this.seriesColor(i, this.yKeys.length),
        }));
      }

      // A legend for a single series is noise (Carbon: omit it). Drop the
      // empty list so it leaves no stray markup.
      if (series.length < 2) {
        this.legendEl.remove();
        this.legendEl = null;
        this.legendBuilt = true;
        return;
      }

      const frag = document.createDocumentFragment();
      this.legendButtons = new Map();
      series.forEach((s, i) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'none');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bdga-chart__legend-item';
        btn.setAttribute('aria-pressed', 'true');
        btn.dataset.bdgaKey = s.key;
        const swatch = document.createElement('span');
        swatch.className = 'bdga-chart__legend-swatch';
        // Mirror the mark's texture so the key stays truthful.
        if (this.texture) swatch.classList.add(`bdga-chart__legend-swatch--tex${i % 5}`);
        swatch.setAttribute('aria-hidden', 'true');
        swatch.style.backgroundColor = s.color;
        const label = document.createElement('span');
        label.className = 'bdga-chart__legend-label';
        label.textContent = s.label;
        btn.append(swatch, label);
        btn.addEventListener('click', () => this.toggleSeries(s.key, s.label));
        btn.addEventListener('mouseenter', () => this.emphasizeSeries(s.key));
        btn.addEventListener('mouseleave', () => this.emphasizeSeries(null));
        btn.addEventListener('focus', () => this.emphasizeSeries(s.key));
        btn.addEventListener('blur', () => this.emphasizeSeries(null));
        li.appendChild(btn);
        frag.appendChild(li);
        this.legendButtons.set(s.key, btn);
      });
      this.legendEl.replaceChildren(frag);
      this.legendBuilt = true;
    }

    toggleSeries(key, label) {
      const willHide = !this.hidden.has(key);
      if (willHide && this.visibleSeriesCount() <= 1) {
        this.setStatus(Drupal.t('At least one series must stay visible.'));
        return;
      }
      if (willHide) this.hidden.add(key);
      else this.hidden.delete(key);
      const btn = this.legendButtons.get(key);
      if (btn) {
        btn.setAttribute('aria-pressed', String(!willHide));
        btn.classList.toggle('bdga-chart__legend-item--hidden', willHide);
        // Non-colour cue for the hidden state in the accessible name.
        btn.setAttribute('aria-label', willHide ? Drupal.t('@s (hidden)', { '@s': label }) : label);
      }
      this.redraw();
      this.setStatus(
        willHide ? Drupal.t('@s hidden', { '@s': label }) : Drupal.t('@s shown', { '@s': label })
      );
    }

    /**
     * Highlight one series by dropping every other mark to 30% opacity. Inline
     * styles are wiped on the next redraw, so a stale highlight can't persist
     * past a toggle. key === null restores all.
     */
    emphasizeSeries(key) {
      if (!this.canvas) return;
      // key === null is the universal restore: clear every opacity the emphasis
      // paths set (series groups, individual marks, sankey links).
      if (key === null) {
        this.canvas.querySelectorAll('[data-bdga-series],[data-bdga-point]')
          .forEach((m) => { m.style.opacity = ''; });
        this.canvas.querySelectorAll('.bdga-chart__sankey-link')
          .forEach((m) => { m.style.opacity = ''; });
        return;
      }
      this.canvas.querySelectorAll('[data-bdga-series]').forEach((m) => {
        m.style.opacity = m.getAttribute('data-bdga-series') === key ? '' : '0.3';
      });
    }

    /**
     * Emphasize what a hovered/focused mark belongs to; dim the rest to 30%.
     * Multi-series charts emphasize the whole series. Charts that colour marks
     * by a per-mark dimension (color_by a category/field) or sankey/flow nodes
     * emphasize the single mark (and, for sankey, its connected links). Plain
     * single-colour charts have nothing to dim.
     */
    emphasizePoint(pt) {
      if (!pt || !this.canvas) return;
      const sEl = pt.closest('[data-bdga-series]');
      const seriesKey = sEl && sEl.getAttribute('data-bdga-series');
      if (seriesKey && this.yKeys.length > 1) {
        this.emphasizeSeries(seriesKey);
        return;
      }
      const isFlow = this.type === 'sankey' || this.type === 'flow';
      const cb = this.colorBy;
      const perMark = cb && cb !== 'series' && cb !== 'single';
      if (!perMark && !isFlow) return;
      this.canvas.querySelectorAll('[data-bdga-point]').forEach((m) => {
        m.style.opacity = m === pt ? '' : '0.3';
      });
      if (isFlow) {
        const node = window.d3.select(pt).datum();
        const id = node && node.id;
        this.canvas.querySelectorAll('.bdga-chart__sankey-link').forEach((l) => {
          const ld = window.d3.select(l).datum();
          const s = ld && ld.source && ld.source.id;
          const t = ld && ld.target && ld.target.id;
          l.style.opacity = id && (s === id || t === id) ? '' : '0.2';
        });
      }
    }

    /**
     * Carbon emphasis-by-fade for a single flow: raise the hovered link to full
     * opacity and drop every other link to 20%, so one path reads cleanly out
     * of a dense diagram. Nodes are left untouched - the flow is emphasised.
     * Restored by emphasizeSeries(null), which clears every link's inline
     * opacity, so a stale highlight can't survive a redraw or a mouseout.
     */
    emphasizeLink(linkEl) {
      if (!linkEl || !this.canvas) return;
      this.canvas.querySelectorAll('.bdga-chart__sankey-link').forEach((l) => {
        // Explicit '1' beats the generic group-hover rule, which would else
        // hold the focused link at 0.85 while its parent <g> is hovered.
        l.style.opacity = l === linkEl ? '1' : '0.2';
      });
    }

    // -- Keyboard navigation of data points (Phase 3) ------------------------
    //
    // Each data mark is a real, labelled focusable element (role="img" +
    // aria-label), the way @fluentui/react-charting exposes its marks - so a
    // screen reader reads the point when focus lands on it, with no reliance on
    // a live region for point-by-point narration. A roving-tabindex model gives
    // the group a single tab stop; arrow keys then move between points (Left/
    // Right within a series, Up/Down across series), Home/End jump to the ends.
    // A visual tooltip mirrors the label on focus and hover. The data table
    // remains the structural alternative; decorative axis/grid elements stay
    // out of the a11y tree. Sankey/flow nodes keep their <title> tooltips and
    // are not part of this point model.

    formatValue(v) {
      return typeof v === 'number' ? v.toLocaleString(this.locale || undefined) : String(v);
    }

    pointLabel(seriesLabel, xVal, value) {
      const val = this.formatValue(value);
      // Drop the series label when it would just repeat the category.
      return seriesLabel && String(seriesLabel) !== String(xVal)
        ? `${xVal}, ${seriesLabel}: ${val}`
        : `${xVal}: ${val}`;
    }

    /**
     * Register one series' marks for keyboard navigation. `entries` is an
     * ordered array of { el, xVal, value, label? } in x order. Each element
     * becomes a labelled, focusable point; the group is stored so arrow-key
     * navigation can move within and across series.
     */
    addPoints(seriesLabel, entries) {
      const group = [];
      entries.forEach((e) => {
        const label = e.label || this.pointLabel(seriesLabel, e.xVal, e.value);
        e.el.setAttribute('role', 'img');
        e.el.setAttribute('aria-label', label);
        e.el.setAttribute('tabindex', '-1');
        e.el.setAttribute('data-bdga-point', '');
        this.points.push(e.el);
        group.push(e.el);
      });
      if (group.length) this.pointGroups.push(group);
    }

    /**
     * Finalise the point model after a draw: set position attributes, make the
     * first point the single tab stop, and bind the keyboard / pointer / focus
     * handlers once (the canvas element persists across redraws, so the
     * listeners survive replaceChildren).
     */
    /**
     * Expose the plot to assistive tech once its marks are individually
     * labelled and focusable. draw() leaves the canvas aria-hidden ("table is
     * the AT source"); this lifts that, silences the decorative axes /
     * gridlines, and names the svg as a group. `instruction` is appended to the
     * group label to tell the user how to explore (arrow keys vs Tab). Charts
     * with no focusable marks must NOT call this - they stay aria-hidden so the
     * table is the sole AT path.
     */
    exposePlot(instruction) {
      this.canvas.removeAttribute('aria-hidden');
      this.canvas
        .querySelectorAll('.tick, .domain, .bdga-chart__axis-label')
        .forEach((el) => el.setAttribute('aria-hidden', 'true'));
      const svgEl = this.canvas.querySelector('svg');
      if (!svgEl) return;
      svgEl.setAttribute('role', 'group');
      const titleEl = this.root.querySelector('.bdga-chart__title');
      const name = (titleEl && titleEl.textContent.trim()) || this.id || Drupal.t('Chart');
      svgEl.setAttribute(
        'aria-label',
        instruction ? Drupal.t('@t. @i', { '@t': name, '@i': instruction }) : name
      );
    }

    initPointNav() {
      if (!this.points || !this.points.length) return;

      this.exposePlot(Drupal.t('Use arrow keys to move between data points.'));

      this.pointGroups.forEach((group) => {
        group.forEach((el, idx) => {
          el.setAttribute('aria-posinset', String(idx + 1));
          el.setAttribute('aria-setsize', String(group.length));
        });
      });
      this.focusPos = { g: 0, i: 0 };
      // Whether the user has actually focused a point this draw. Toolbar zoom
      // centres on the focused point only when this is true.
      this.pointFocused = false;
      this.pointGroups[0][0].setAttribute('tabindex', '0');

      if (this.pointNavBound) return;
      this.pointNavBound = true;
      this.canvas.addEventListener('keydown', (e) => this.onPointKeydown(e));
      // Pointer + focus parity for the tooltip and series emphasis: hovering or
      // keyboard-focusing a point shows its label and dims the other series,
      // mirroring the legend.
      this.canvas.addEventListener('mouseover', (e) => {
        const pt = e.target.closest('[data-bdga-point]');
        if (pt) { this.showPointTooltip(pt); this.emphasizePoint(pt); return; }
        // Flows (sankey/flow links) are hover-only emphasis targets: pointer
        // affordance on a path that AT reaches through the node labels + table.
        const link = e.target.closest('[data-bdga-link]');
        if (link) { this.showPointTooltip(link); this.emphasizeLink(link); }
      });
      this.canvas.addEventListener('mouseout', (e) => {
        const pt = e.target.closest('[data-bdga-point]');
        if (pt) { this.hidePointTooltip(); this.emphasizeSeries(null); return; }
        const link = e.target.closest('[data-bdga-link]');
        if (link) { this.hidePointTooltip(); this.emphasizeSeries(null); }
      });
      this.canvas.addEventListener('focusin', (e) => {
        const pt = e.target.closest && e.target.closest('[data-bdga-point]');
        if (!pt) return;
        this.syncFocusPos(pt);
        this.showPointTooltip(pt);
        this.emphasizePoint(pt);
      });
      this.canvas.addEventListener('focusout', (e) => {
        const pt = e.target.closest && e.target.closest('[data-bdga-point]');
        if (pt) { this.hidePointTooltip(); this.emphasizeSeries(null); }
      });
    }

    /** Locate a focused point so arrow keys resume from it. */
    syncFocusPos(el) {
      for (let g = 0; g < this.pointGroups.length; g += 1) {
        const i = this.pointGroups[g].indexOf(el);
        if (i !== -1) {
          if (this.focusPos) {
            const prev = this.pointGroups[this.focusPos.g] &&
              this.pointGroups[this.focusPos.g][this.focusPos.i];
            if (prev && prev !== el) prev.setAttribute('tabindex', '-1');
          }
          el.setAttribute('tabindex', '0');
          this.focusPos = { g, i };
          this.pointFocused = true;
          return;
        }
      }
    }

    onPointKeydown(e) {
      if (!this.pointGroups.length || !this.focusPos) return;

      // Keyboard zoom while a point is focused: +/- around it, 0 resets.
      if (this.applicableZoom()) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          this.zoomIn(this.currentFullIndex(), true);
          return;
        }
        if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          this.zoomOut(this.currentFullIndex(), true);
          return;
        }
        if (e.key === '0') {
          e.preventDefault();
          // Reset to the full extent but keep focus on the same point.
          this.zoomReset(this.currentFullIndex(), true);
          return;
        }
      }

      let { g, i } = this.focusPos;
      const groups = this.pointGroups;
      switch (e.key) {
        case 'ArrowRight':
          i = Math.min(i + 1, groups[g].length - 1);
          break;
        case 'ArrowLeft':
          i = Math.max(i - 1, 0);
          break;
        case 'ArrowDown':
          g = Math.min(g + 1, groups.length - 1);
          i = Math.min(i, groups[g].length - 1);
          break;
        case 'ArrowUp':
          g = Math.max(g - 1, 0);
          i = Math.min(i, groups[g].length - 1);
          break;
        case 'Home':
          i = 0;
          break;
        case 'End':
          i = groups[g].length - 1;
          break;
        case 'Escape':
          this.hidePointTooltip();
          return;
        default:
          return;
      }
      e.preventDefault();
      this.focusPoint(g, i);
    }

    focusPoint(g, i) {
      const groups = this.pointGroups;
      const prev = groups[this.focusPos.g] && groups[this.focusPos.g][this.focusPos.i];
      if (prev) prev.setAttribute('tabindex', '-1');
      this.focusPos = { g, i };
      this.pointFocused = true;
      const el = groups[g][i];
      el.setAttribute('tabindex', '0');
      el.focus();
      this.showPointTooltip(el);
    }

    showPointTooltip(el) {
      if (!this.canvas) return;
      let tip = this.tooltipEl;
      if (!tip) {
        tip = document.createElement('div');
        tip.className = 'bdga-chart__tooltip';
        tip.setAttribute('aria-hidden', 'true');
        this.canvas.appendChild(tip);
        this.tooltipEl = tip;
      }
      tip.textContent = el.getAttribute('aria-label') || '';
      // Position relative to the canvas, centred above the mark.
      const cRect = this.canvas.getBoundingClientRect();
      const mRect = el.getBoundingClientRect();
      const left = mRect.left - cRect.left + mRect.width / 2;
      const top = mRect.top - cRect.top;
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
      tip.dataset.visible = 'true';
    }

    hidePointTooltip() {
      if (this.tooltipEl) delete this.tooltipEl.dataset.visible;
    }

    readTable() {
      if (!this.tableEl) return [];
      // Prefer the canonical data key from the <th data-bdga-key> attribute;
      // fall back to text content for backward compat with hand-written markup.
      const headerKeys = Array.from(this.tableEl.querySelectorAll('thead th')).map(
        (th) => (th.dataset && th.dataset.bdgaKey) || th.textContent.trim()
      );
      if (!this.xKey && headerKeys[0]) this.xKey = headerKeys[0];
      if (!this.yKeys.length) {
        this.yKeys = headerKeys.slice(1).filter(Boolean);
      }
      return Array.from(this.tableEl.querySelectorAll('tbody tr'))
        .slice(0, MAX_ROWS)
        .map((tr) => {
          const cells = tr.querySelectorAll('th, td');
          const row = {};
          cells.forEach((cell, i) => {
            const key = (cell.dataset && cell.dataset.bdgaKey) || headerKeys[i] || (`col_${  i}`);
            const raw =
              cell.dataset && cell.dataset.value !== undefined
                ? cell.dataset.value
                : cell.textContent;
            row[key] = raw.trim();
          });
          this.yKeys.forEach((y) => {
            const n = Number(row[y]);
            row[y] = Number.isFinite(n) ? n : 0;
          });
          row[this.xKey] = String(row[this.xKey]);
          return row;
        });
    }

    async loadFromUrl() {
      if (!this.url) return this.fail('Missing source URL');
      let url;
      try {
        url = new URL(this.url);
      } catch {
        return this.fail('Invalid URL');
      }
      if (url.protocol !== 'https:') return this.fail('Insecure URL scheme');
      if (!ALLOWED_HOSTS.includes(url.hostname)) {
        return this.fail(`Host not on allowlist: ${  url.hostname}`);
      }

      this.setStatus(Drupal.t('Loading chart data...'));

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      let payload;
      try {
        const res = await fetch(url.toString(), {
          method: 'GET',
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          mode: 'cors',
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timer);
        if (!res.ok) return this.fail(`HTTP ${  res.status}`);
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (ct.indexOf('application/json') === -1) {
          return this.fail(`Unexpected content-type: ${  ct}`);
        }
        payload = await res.json();
      } catch (err) {
        clearTimeout(timer);
        return this.fail(`Fetch failed: ${  err.message || err}`);
      }

      const rows = this.extractCkanRows(payload);
      if (!rows.length) return this.fail('No rows returned');

      // Sankey / flow: the wire shape is a list of {source, target, value}
      // rows. Build nodes + links here so the renderer path is identical
      // to JSON-mode flow charts.
      if (this.type === 'sankey' || this.type === 'flow') {
        const graph = this.buildSankeyFromRows(rows);
        if (!graph.links.length) {
          return this.fail('CKAN response had no usable source/target/value rows');
        }
        if (typeof window.d3.sankey !== 'function') {
          return this.fail('d3-sankey plugin missing');
        }
        this.nodes = graph.nodes;
        this.links = graph.links;
        this.populateFlowTable(graph.links);
        this.updateFlowTableHeaders(graph.nodes);
        this.setStatus(
          Drupal.t('Chart loaded. @count flows, @nodes nodes.', {
            '@count': graph.links.length,
            '@nodes': graph.nodes.length,
          })
        );
        return this.draw([]);
      }

      this.populateTable(rows);
      this.setStatus(
        Drupal.t('Chart loaded. @count rows.', { '@count': rows.length })
      );
      this.fullRows = rows;
      this.setupFilters();
      this.drawFiltered();
    }

    extractCkanRows(payload) {
      // CKAN datastore_search response: { result: { records: [...] } }
      const records =
        payload && payload.result && Array.isArray(payload.result.records)
          ? payload.result.records
          : Array.isArray(payload)
            ? payload
            : [];
      const isFlow = this.type === 'sankey' || this.type === 'flow';
      const yKeySet = new Set(this.yKeys || []);
      // For flow types the y-key set is fixed; the wire shape carries a
      // single numeric column called 'value' regardless of authored y_keys.
      if (isFlow) {
        yKeySet.clear();
        yKeySet.add('value');
      }
      return records.slice(0, MAX_ROWS).map((r) => {
        const out = {};
        // Preserve EVERY column from the source record so downstream renderers
        // (e.g. lollipop's color_by:category lookup) can find non-axis fields
        // like Tier. Numeric Y columns are coerced to Number; everything
        // else (including string columns and the X key) stays as a string.
        // Objects/arrays in the record are dropped: extractCkanRows is a
        // sanitisation boundary, not a generic deep clone.
        //
        // MAX_ROWS caps row count, MAX_CELL_CHARS caps each string cell.
        // Together they bound the payload that lands in the table fallback
        // and any downstream renderer; authors should still constrain their
        // SELECT to the columns they need (Project name, Tier, etc.) rather
        // than SELECT * against a wide CKAN resource.
        Object.keys(r || {}).forEach((k) => {
          const v = r[k];
          if (v === null || v === undefined) {
            out[k] = '';
            return;
          }
          if (typeof v === 'object') {
            // Skip nested structures - we never plot them and they'd
            // serialise as "[object Object]" if cast to string.
            return;
          }
          if (yKeySet.has(k)) {
            const n = Number(v);
            out[k] = Number.isFinite(n) ? n : 0;
            return;
          }
          const s = String(v);
          out[k] = s.length > MAX_CELL_CHARS ? `${s.slice(0, MAX_CELL_CHARS)  }…` : s;
        });
        return out;
      });
    }

    /**
     * Transform a CKAN response into {nodes, links} for d3-sankey.
     *
     * Two wire shapes are supported, distinguished by the first record's
     * keys:
     *
     *  (a) Flat-row: `{source, target, value}` per row. Mirrors the
     *      server-side _bdga_chart_parse_sankey_json flat-row branch.
     *      Self-loops, non-positive values, and missing source/target
     *      are skipped.
     *
     *  (b) Wide-cascade: `{stage1, stage2, ..., stageN, value}` per row.
     *      Each row produces N-1 links chaining adjacent stages, with
     *      node ids prefixed by the column name so values that repeat
     *      across stages (e.g. "High" in 2024 and 2026) don't collapse
     *      into a single node. Null / empty cells drop that stage's
     *      adjacency rather than synthesising a placeholder node; if
     *      fewer than 2 stages survive in a row, the row contributes
     *      no links. Duplicate (source, target) pairs are summed.
     *
     * Node order in the returned array is the order ids are first seen,
     * which keeps the d3-sankey layout stable across reloads.
     */
    buildSankeyFromRows(rows) {
      if (!rows.length) return { nodes: [], links: [] };
      const first = rows[0];
      const hasFlatKeys = 'source' in first && 'target' in first && 'value' in first;
      if (hasFlatKeys) {
        return this.buildSankeyFromFlatRows(rows);
      }
      // Stage columns = every key except `value`, in insertion order.
      // CKAN preserves SELECT-clause order so this matches the SQL the
      // author wrote.
      const stageCols = Object.keys(first).filter((k) => k !== 'value');
      if (stageCols.length < 2) return { nodes: [], links: [] };
      return this.buildSankeyFromCascadeRows(rows, stageCols);
    }

    buildSankeyFromFlatRows(rows) {
      // d3-sankey is a DAG layout: it cannot render edges where source ===
      // target, and the row carries genuine signal (e.g. 12 projects whose
      // DCA rating stayed at Medium-High between 2025 and 2026). When the
      // author writes a 2-stage SQL like
      //   SELECT "DCA 2025" AS source, "DCA 2026" AS target, COUNT(*) AS value
      // the labels overlap. We pre-scan for that collision and, if it
      // occurs anywhere, auto-prefix every row's source/target with
      // generic "From: " / "To: " markers so the data survives. Authors
      // who want nicer node labels can prefix at SQL time, e.g.
      //   SELECT '2025: ' || "DCA 2025" AS source,
      //          '2026: ' || "DCA 2026" AS target,
      // in which case the pre-scan finds no collision and the labels pass
      // through untouched.
      let hasCollision = false;
      for (let i = 0; i < rows.length; i += 1) {
        const r = rows[i];
        const s = String(r.source ?? '').trim();
        const t = String(r.target ?? '').trim();
        if (s && t && s === t) {
          hasCollision = true;
          break;
        }
      }

      const seen = new Set();
      const nodes = [];
      const links = [];
      let droppedSelfLoops = 0;
      rows.forEach((r) => {
        let src = String(r.source ?? '').trim();
        let tgt = String(r.target ?? '').trim();
        const val = Number(r.value);
        if (!src || !tgt) return;
        if (!Number.isFinite(val) || val <= 0) return;
        if (hasCollision) {
          src = `From: ${  src}`;
          tgt = `To: ${  tgt}`;
        }
        if (src === tgt) {
          // Should not occur after auto-prefixing; left as a guard.
          droppedSelfLoops += 1;
          return;
        }
        [src, tgt].forEach((id) => {
          if (!seen.has(id)) {
            seen.add(id);
            nodes.push({ id });
          }
        });
        links.push({ source: src, target: tgt, value: val });
      });
      if (droppedSelfLoops && window.console) {
        window.console.warn(`[bdga-chart] ${  this.id  }: dropped ${  droppedSelfLoops  } self-loop rows`);
      }
      return { nodes, links };
    }

    buildSankeyFromCascadeRows(rows, stageCols) {
      const seen = new Set();
      const nodes = [];
      const linkMap = new Map();
      // Stage column -> integer index in author SELECT order. Captured here
      // and attached to each node so drawSankeyInternal can force the
      // d3-sankey layer assignment directly, rather than guessing stage
      // order from the order chains happen to enter the link map. Leading
      // null rows in the CKAN response would otherwise seed the first
      // non-null column as layer 0 regardless of where it semantically
      // belongs - that bug had the 2025 column rendering leftmost and the
      // 2024 column rendering rightmost.
      const stageOf = new Map(stageCols.map((c, i) => [c, i]));
      const addNode = (id, stage) => {
        if (!seen.has(id)) {
          seen.add(id);
          nodes.push({ id, stage });
        }
      };
      rows.forEach((r) => {
        const val = Number(r.value);
        if (!Number.isFinite(val) || val <= 0) return;
        // Resolve each stage label, dropping nulls/empties. The prefix
        // keeps stage-N nodes distinct from stage-M nodes when their
        // labels overlap (e.g. "High" appears in every DCA year column).
        const chain = [];
        stageCols.forEach((c) => {
          const v = r[c];
          if (v === null || v === undefined || v === '') return;
          chain.push({ id: `${c  }: ${  String(v).trim()}`, stage: stageOf.get(c) });
        });
        if (chain.length < 2) return;
        chain.forEach((step) => addNode(step.id, step.stage));
        for (let i = 0; i < chain.length - 1; i += 1) {
          const src = chain[i].id;
          const tgt = chain[i + 1].id;
          if (src === tgt) {
            // Self-loops happen when a project's rating didn't change between
            // adjacent stages. d3-sankey rejects self-edges, so we drop
            // them - they're already implied by the unchanged column
            // position in the layout.
            continue;
          }
          const key = `${src  } ${  tgt}`;
          const existing = linkMap.get(key);
          if (existing) {
            existing.value += val;
          }
          else {
            linkMap.set(key, { source: src, target: tgt, value: val });
          }
        }
      });
      return { nodes, links: Array.from(linkMap.values()) };
    }

    populateTable(rows) {
      if (!this.tableEl) return;
      const tbody = this.tableEl.querySelector('tbody');
      if (!tbody) return;
      // textContent only; no HTML.
      const frag = document.createDocumentFragment();
      rows.forEach((row) => {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.setAttribute('scope', 'row');
        th.textContent = row[this.xKey];
        tr.appendChild(th);
        this.yKeys.forEach((y) => {
          const td = document.createElement('td');
          td.dataset.value = String(row[y]);
          td.textContent = String(row[y]);
          tr.appendChild(td);
        });
        frag.appendChild(tr);
      });
      tbody.replaceChildren(frag);
    }

    /**
     * Sankey/flow fallback table. Three columns: source, target, value.
     * Server-side rendering already emits the matching <thead>; this only
     * fills <tbody> after a URL-mode fetch.
     */
    populateFlowTable(links) {
      if (!this.tableEl) return;
      const tbody = this.tableEl.querySelector('tbody');
      if (!tbody) return;
      const frag = document.createDocumentFragment();
      links.forEach((l) => {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.setAttribute('scope', 'row');
        th.textContent = String(l.source);
        tr.appendChild(th);
        const tdTarget = document.createElement('td');
        tdTarget.textContent = String(l.target);
        tr.appendChild(tdTarget);
        const tdValue = document.createElement('td');
        tdValue.dataset.value = String(l.value);
        tdValue.textContent = String(l.value);
        tr.appendChild(tdValue);
        frag.appendChild(tr);
      });
      tbody.replaceChildren(frag);
    }

    /**
     * Rewrite the source / target column headers of the fallback table
     * using prefixes detected on the nodes. Mirrors the PHP helper
     * _bdga_chart_sankey_table_labels: a clean 2-stage graph (every node
     * "prefix: label", exactly two distinct prefixes) emits its prefixes
     * as headers; anything else leaves the server-rendered defaults
     * ("From" / "To") in place. The value column is the y_label fallback
     * already baked into the template by Twig.
     *
     * Only the URL-mode path needs this - JSON-mode flow charts have
     * their headers computed server-side and rendered correctly on first
     * paint.
     */
    updateFlowTableHeaders(nodes) {
      if (!this.tableEl || !nodes || !nodes.length) return;
      const prefixes = [];
      for (let i = 0; i < nodes.length; i += 1) {
        const id = String(nodes[i].id || '');
        const sep = id.indexOf(': ');
        if (sep === -1) return; // mixed shape - keep defaults
        const p = id.slice(0, sep);
        if (prefixes.indexOf(p) === -1) {
          prefixes.push(p);
          if (prefixes.length > 2) return; // 3+ stages - keep generic headers
        }
      }
      if (prefixes.length !== 2) return;
      const srcTh = this.tableEl.querySelector('thead [data-bdga-key="source"]');
      const tgtTh = this.tableEl.querySelector('thead [data-bdga-key="target"]');
      if (srcTh) srcTh.textContent = prefixes[0];
      if (tgtTh) tgtTh.textContent = prefixes[1];
    }

    // -- Filters (interactive, client-side) ----------------------------------
    //
    // Author-declared filters ({ key, label?, values? }, via config_json) build
    // one control per dimension. Within a filter the selected values are OR-ed;
    // across filters they are AND-ed. The renderer owns the controls + redraw;
    // the fallback data table stays complete (filters affect only the visual).

    /** Distinct non-empty stringified values of a column, first-seen order. */
    distinctValues(rows, key) {
      const seen = new Set();
      const out = [];
      rows.forEach((r) => {
        const v = String(r[key] ?? '');
        if (v !== '' && !seen.has(v)) { seen.add(v); out.push(v); }
      });
      return out;
    }

    /**
     * Build the filter controls from this.filters into the filter bar. No-op
     * without configured filters, a bar element, or for the node-link types.
     * Every filter starts fully selected.
     */
    setupFilters() {
      if (!this.filtersBarEl || !this.filters.length) return;
      if (this.type === 'sankey' || this.type === 'flow') return;
      const rows = this.fullRows || [];
      this.activeFilters = new Map();
      const groups = [];
      this.filters.forEach((f, idx) => {
        if (!f || !f.key) return;
        const values = (Array.isArray(f.values) && f.values.length)
          ? f.values.map(String)
          : this.distinctValues(rows, f.key);
        if (!values.length) return;
        this.activeFilters.set(f.key, new Set(values));
        groups.push(this.buildFilterControl(f, values, idx));
      });
      if (!groups.length) return;
      this.filtersBarEl.replaceChildren(...groups);
      this.filtersBarEl.hidden = false;
    }

    /**
     * One filter's disclosure. Reuses the tabs mobile-disclosure shell - funnel
     * icon, label, chevron - opening to a checkbox per value.
     */
    buildFilterControl(f, values, idx) {
      const label = f.label || f.key;
      // CivicTheme checkbox/label theming keys on the theme class being on the
      // element itself, so mirror the chart's theme onto each control.
      const themeClass = this.root && this.root.classList.contains('ct-theme-dark')
        ? 'ct-theme-dark'
        : 'ct-theme-light';
      const details = document.createElement('details');
      details.className = 'bdga-chart__filter';

      const summary = document.createElement('summary');
      summary.className = 'bdga-chart__filter-summary';
      const icon = document.createElement('span');
      icon.className = 'bdga-chart__filter-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = FILTER_ICON_SVG;
      const labelEl = document.createElement('span');
      labelEl.className = 'bdga-chart__filter-label';
      labelEl.textContent = `${label}: ${values.length} of ${values.length}`;
      const chevron = document.createElement('span');
      chevron.className = 'bdga-chart__filter-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = FILTER_CHEVRON_SVG;
      summary.append(icon, labelEl, chevron);
      details.appendChild(summary);

      const fieldset = document.createElement('fieldset');
      fieldset.className = 'bdga-chart__filter-options';
      const legend = document.createElement('legend');
      legend.className = 'visually-hidden';
      legend.textContent = label;
      fieldset.appendChild(legend);
      const base = `${this.id || 'chart'}-f${idx}`;
      values.forEach((val, vIdx) => {
        const optionId = `${base}-o${vIdx}`;
        const option = document.createElement('div');
        option.className = 'bdga-chart__filter-option';
        // CivicTheme checkbox atom: a styled <input class="ct-checkbox"> with a
        // sibling <label> (ct-checkbox's CSS keys on `input + label`).
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = `ct-checkbox ${themeClass}`;
        checkbox.id = optionId;
        checkbox.checked = true;
        checkbox.value = val;
        checkbox.addEventListener('change', () => {
          this.onFilterChange(f.key, val, checkbox.checked, labelEl, label, values.length);
        });
        const optionLabel = document.createElement('label');
        optionLabel.className = `ct-label ct-label--small ct-checkbox__label ${themeClass}`;
        optionLabel.setAttribute('for', optionId);
        optionLabel.textContent = val;
        option.append(checkbox, optionLabel);
        fieldset.appendChild(option);
      });
      details.appendChild(fieldset);
      return details;
    }

    onFilterChange(key, value, checked, labelEl, label, total) {
      const active = this.activeFilters.get(key);
      if (!active) return;
      if (checked) active.add(value); else active.delete(value);
      if (labelEl) labelEl.textContent = `${label}: ${active.size} of ${total}`;
      this.drawFiltered();
    }

    /** Rows passing every filter (the row's value is in that filter's set). */
    applyFilters(rows) {
      if (!this.activeFilters || !this.activeFilters.size) return rows;
      const entries = Array.from(this.activeFilters.entries());
      return rows.filter((row) => entries.every(([key, active]) => active.has(String(row[key] ?? ''))));
    }

    /** Draw the filtered view, or an empty state when nothing matches. */
    drawFiltered() {
      const rows = this.applyFilters(this.fullRows || []);
      if (!rows.length) {
        this.showFilterEmptyState();
        return;
      }
      this.draw(rows);
      if (this.activeFilters && this.activeFilters.size) {
        this.setStatus(Drupal.t('Showing @n of @total rows.', {
          '@n': rows.length,
          '@total': (this.fullRows || []).length,
        }));
      }
    }

    showFilterEmptyState() {
      this.lastDrawData = [];
      if (this.canvas) {
        this.canvas.replaceChildren();
        const p = document.createElement('p');
        p.className = 'bdga-chart__empty';
        p.textContent = Drupal.t('No data matches the selected filters.');
        this.canvas.appendChild(p);
      }
      this.setStatus(Drupal.t('No data matches the selected filters.'));
    }

    draw(rows) {
      // Remember the inputs and the width we drew at so the ResizeObserver can
      // re-lay-out crisply on a container-width change. URL-mode reuses these
      // fetched rows on redraw - it never refetches.
      this.lastDrawData = rows;
      this.lastDrawWidth = this.canvas.clientWidth || 640;

      // Wipe any previous render and reveal the canvas to sighted users.
      this.canvas.replaceChildren();
      this.canvas.removeAttribute('aria-hidden');
      this.canvas.setAttribute('aria-hidden', 'true'); // table is the AT source.

      // Resolve palette from CSS once per draw (getComputedStyle is fast).
      this.palette = resolvePalette(this.root);

      // Build the legend on first draw (needs palette + data); the guard makes
      // it a no-op on subsequent redraws.
      this.buildLegend();

      // Reset per-draw keyboard-nav state. Renderers register their marks via
      // addPoints(); initPointNav() finalises the roving model afterwards.
      this.points = [];
      this.pointGroups = [];
      // Pattern <defs> live inside each freshly built svg, so the id cache
      // resets per draw.
      this.patternIds = new Set();

      // Apply data-domain zoom for the ordinal cartesian types. lastDrawData
      // keeps the full set (so zoom-out restores and downloads stay complete);
      // only the rows handed to the renderer are windowed.
      const drawRows = this.applicableZoom() ? this.sliceZoom(rows) : rows;

      switch (this.type) {
        case 'line':
          this.drawLine(drawRows);
          break;
        case 'pie':
          this.drawPie(drawRows);
          break;
        case 'stacked_bar':
          this.drawStackedBar(drawRows);
          break;
        case 'grouped_bar':
          this.drawGroupedBar(drawRows);
          break;
        case 'sankey':
          this.drawSankey();
          break;
        case 'flow':
          this.drawFlow();
          break;
        case 'lollipop':
          this.drawLollipop(drawRows);
          break;
        case 'cleveland':
          this.drawCleveland(drawRows);
          break;
        case 'bar':
        default:
          this.drawBar(drawRows);
          break;
      }

      this.initPointNav();
    }

    /**
     * Decide whether X-axis labels need rotation, based on category count and
     * label length. Returns null when no rotation needed (stays horizontal).
     */
    xAxisRotation(rows) {
      if (!rows || !rows.length) return null;
      const labels = rows.map((r) => String(r[this.xKey] || ''));
      const maxLen = labels.reduce((acc, s) => Math.max(acc, s.length), 0);
      const count = labels.length;
      // Heuristic: rotate if too many categories OR any label is long enough
      // to collide with neighbours.
      if (count > 6 || maxLen > 14) return -30;
      return null;
    }

    /**
     * Bottom margin grows when labels are rotated, to leave room for the
     * angled text without clipping. Extra space is also reserved for the
     * axis title text emitted by drawAxisLabels: ~22px below the X axis,
     * ~24px to the left of the Y axis when those titles are present.
     */
    dims(rows) {
      const w = this.canvas.clientWidth || 640;
      const h = Math.min(Math.max(w * 0.5, 280), 480);
      const rotation = this.xAxisRotation(rows);
      const maxLen = rows
        ? rows.reduce((acc, r) => Math.max(acc, String(r[this.xKey] || '').length), 0)
        : 0;
      const xLabelExtra = this.xLabel ? 22 : 0;
      const yLabelExtra = this.yLabel ? 24 : 0;
      const bottom = (rotation
        ? Math.min(48 + Math.ceil(maxLen * 4.2), 160)
        : 48) + xLabelExtra;
      return {
        w,
        h: rotation ? h + (bottom - 48 - xLabelExtra) + xLabelExtra : h + xLabelExtra,
        m: { top: 16, right: 24, bottom, left: 56 + yLabelExtra },
        rotation,
      };
    }

    /**
     * Append the X and Y axis title text to an SVG root. Called by every chart
     * type that has axes (pie skips this). Reads this.xLabel / this.yLabel set
     * in the constructor; empty strings render nothing. Classes drive font /
     * fill via chart.css; no inline styling here.
     */
    drawAxisLabels(svg, w, h, m) {
      if (this.xLabel) {
        svg
          .append('text')
          .attr('class', 'bdga-chart__axis-label bdga-chart__axis-label--x')
          .attr('x', m.left + (w - m.left - m.right) / 2)
          .attr('y', h - 6)
          .attr('text-anchor', 'middle')
          .text(this.xLabel);
      }
      if (this.yLabel) {
        // Rotated -90deg around (0,0); x/y are in the rotated frame, so x is
        // the vertical position (negated) and y is the horizontal position.
        svg
          .append('text')
          .attr('class', 'bdga-chart__axis-label bdga-chart__axis-label--y')
          .attr('transform', 'rotate(-90)')
          .attr('x', -(m.top + (h - m.top - m.bottom) / 2))
          .attr('y', 14)
          .attr('text-anchor', 'middle')
          .text(this.yLabel);
      }
    }

    /**
     * Apply rotation to the tick labels on the last-rendered X axis group.
     * Truncates labels longer than 28 chars with an ellipsis, keeping the
     * full text in a <title> child so screen-reader / hover users see all.
     */
    rotateXLabels(svg, rotation) {
      if (!rotation) return;
      const ticks = svg.selectAll('g.tick text').nodes();
      ticks.forEach((t) => {
        const full = t.textContent;
        if (full.length > 28) {
          t.textContent = `${full.slice(0, 27)  }…`;
          const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
          title.textContent = full;
          t.parentNode.appendChild(title);
        }
        t.setAttribute('text-anchor', 'end');
        t.setAttribute('transform', `translate(-8,4) rotate(${  rotation  })`);
      });
    }

    svgRoot(w, h) {
      return window.d3
        .select(this.canvas)
        .append('svg')
        .attr('viewBox', `0 0 ${  w  } ${  h}`)
        .attr('role', 'presentation')
        .attr('focusable', 'false');
    }

    drawBar(rows) {
      const d3 = window.d3;
      const { w, h, m, rotation } = this.dims(rows);
      const svg = this.svgRoot(w, h);
      const yKey = this.yKeys[0];

      const x = d3
        .scaleBand()
        .domain(rows.map((r) => r[this.xKey]))
        .range([m.left, w - m.right])
        .padding(0.15);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(rows, (r) => r[yKey]) || 1])
        .nice()
        .range([h - m.bottom, m.top]);

      const xAxis = svg
        .append('g')
        .attr('transform', `translate(0,${  h - m.bottom  })`)
        .call(d3.axisBottom(x));
      svg.append('g').attr('transform', `translate(${  m.left  },0)`).call(d3.axisLeft(y));
      this.rotateXLabels(xAxis, rotation);

      // Single-series bar charts default to one colour (palette.single) per
      // IBM Carbon convention: for time-series bars the colour carries no
      // information and rainbow bars are visual noise. Authors opt into
      // per-category colouring via field_bdga_p_chart_color_by when the X
      // axis is categorical (e.g. agency types) and colour reinforces the
      // distinction between bars.
      const palette = this.palette;
      // Per-bar colour is opt-in and explicit via color_by:
      //  - a row field name -> colour by that field (sequential ramp when the
      //    values are rankable/ordinal e.g. confidence tiers, else categorical)
      //  - 'category'       -> one categorical colour per X-position (few only)
      //  - else             -> single navy. The default: on a large name axis
      //    colour carries no meaning, so the filter and data table do the work.
      const cb = this.colorBy;
      const colorField = (cb && cb !== 'series' && cb !== 'category' && cb !== 'single'
        && rows[0] && Object.prototype.hasOwnProperty.call(rows[0], cb)) ? cb : null;
      let barFill;
      if (colorField) {
        const cats = Array.from(new Set(rows.map((r) => r[colorField])));
        if (cats.every((c) => rankOf(c) !== null)) {
          const ordered = [...cats].sort((a, b) => rankOf(a) - rankOf(b));
          barFill = (d) => shadeSequential(palette, ordered.indexOf(d[colorField]), ordered.length);
        } else {
          const scale = d3.scaleOrdinal().domain(cats).range(palette.categorical);
          barFill = (d) => scale(d[colorField]);
        }
      } else if (cb === 'category' && this.yKeys.length === 1) {
        barFill = (_d, i) => (i < palette.categorical.length
          ? palette.categorical[i]
          : shadeSequential(palette, i, rows.length));
      } else {
        barFill = palette.single;
      }

      const bars = svg
        .append('g')
        .selectAll('rect')
        .data(rows)
        .join('rect')
        .attr('x', (d) => x(d[this.xKey]))
        .attr('y', (d) => y(d[yKey]))
        .attr('width', x.bandwidth())
        .attr('height', (d) => y(0) - y(d[yKey]))
        .attr('fill', barFill);

      this.addPoints(
        this.yLabel || yKey,
        bars.nodes().map((el) => {
          const d = d3.select(el).datum();
          return { el, xVal: d[this.xKey], value: d[yKey] };
        })
      );

      this.drawAxisLabels(svg, w, h, m);
    }

    /**
     * Grouped bar chart - multiple Y series rendered side-by-side within each
     * X category. Uses two d3.scaleBand instances (outer for categories,
     * inner for series). Single-series data degenerates cleanly to one bar
     * per category, matching drawBar.
     */
    drawGroupedBar(rows) {
      const d3 = window.d3;
      const { w, h, m, rotation } = this.dims(rows);
      const svg = this.svgRoot(w, h);
      // Only the visible series are plotted; colours stay keyed to the full
      // y-key list so a series keeps its colour when others are toggled off.
      const keys = this.visibleKeys();

      const x0 = d3
        .scaleBand()
        .domain(rows.map((r) => r[this.xKey]))
        .range([m.left, w - m.right])
        .paddingInner(0.2);

      const x1 = d3
        .scaleBand()
        .domain(keys)
        .range([0, x0.bandwidth()])
        .padding(0.05);

      const yMax = d3.max(rows, (r) => d3.max(keys, (k) => r[k])) || 1;
      const y = d3.scaleLinear().domain([0, yMax]).nice().range([h - m.bottom, m.top]);

      // Same palette policy as stacked bar: categorical in order, sequential
      // fallback when series count exceeds the palette.
      const useSequential = this.yKeys.length > this.palette.categorical.length;
      const palette = this.palette;
      const color = useSequential
        ? (key) => shadeSequential(palette, this.yKeys.indexOf(key), this.yKeys.length)
        : d3.scaleOrdinal().domain(this.yKeys).range(palette.categorical);

      const xAxis = svg
        .append('g')
        .attr('transform', `translate(0,${  h - m.bottom  })`)
        .call(d3.axisBottom(x0));
      svg.append('g').attr('transform', `translate(${  m.left  },0)`).call(d3.axisLeft(y));
      this.rotateXLabels(xAxis, rotation);

      const groupRects = svg
        .append('g')
        .selectAll('g')
        .data(rows)
        .join('g')
        .attr('transform', (d) => `translate(${  x0(d[this.xKey])  },0)`)
        .selectAll('rect')
        .data((d) => keys.map((key) => ({ key, value: +d[key] || 0 })))
        .join('rect')
        .attr('x', (d) => x1(d.key))
        .attr('y', (d) => y(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', (d) => y(0) - y(d.value))
        .attr('data-bdga-series', (d) => d.key)
        .attr('fill', (d) => this.fillFor(svg, this.yKeys.indexOf(d.key), color(d.key)));

      // Register one navigable group per visible series. The inner rect's datum
      // is { key, value }; its parent <g> holds the row, so the category label
      // comes from the parent's datum.
      const groupRectNodes = groupRects.nodes();
      keys.forEach((key) => {
        const entries = groupRectNodes
          .map((el) => ({ el, d: d3.select(el).datum(), row: d3.select(el.parentNode).datum() }))
          .filter((o) => o.d.key === key)
          .map((o) => ({ el: o.el, xVal: o.row[this.xKey], value: o.d.value }));
        this.addPoints(key, entries);
      });

      this.drawAxisLabels(svg, w, h, m);
    }

    drawStackedBar(rows) {
      const d3 = window.d3;
      const { w, h, m, rotation } = this.dims(rows);
      const svg = this.svgRoot(w, h);
      // Stack only the visible series; the stack re-bases from zero so hiding a
      // series cleanly removes its band.
      const series = d3.stack().keys(this.visibleKeys())(rows);

      const x = d3
        .scaleBand()
        .domain(rows.map((r) => r[this.xKey]))
        .range([m.left, w - m.right])
        .padding(0.15);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(series, (s) => d3.max(s, (d) => d[1])) || 1])
        .nice()
        .range([h - m.bottom, m.top]);
      // Multi-series stacked bar: categorical palette in order. If the chart
      // has more series than palette colours, switch to sequential shades of
      // Dark blue to keep adjacent series distinguishable.
      const useSequential = this.yKeys.length > this.palette.categorical.length;
      const palette = this.palette;
      const color = useSequential
        ? (key) => shadeSequential(palette, this.yKeys.indexOf(key), this.yKeys.length)
        : d3.scaleOrdinal().domain(this.yKeys).range(palette.categorical);

      const xAxis = svg
        .append('g')
        .attr('transform', `translate(0,${  h - m.bottom  })`)
        .call(d3.axisBottom(x));
      svg.append('g').attr('transform', `translate(${  m.left  },0)`).call(d3.axisLeft(y));
      this.rotateXLabels(xAxis, rotation);

      const stackRects = svg
        .append('g')
        .selectAll('g')
        .data(series)
        .join('g')
        .attr('fill', (s) => this.fillFor(svg, this.yKeys.indexOf(s.key), color(s.key)))
        .attr('data-bdga-series', (s) => s.key)
        .selectAll('rect')
        .data((s) => s)
        .join('rect')
        .attr('x', (d) => x(d.data[this.xKey]))
        .attr('y', (d) => y(d[1]))
        .attr('height', (d) => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth());

      // Register one navigable group per visible series. The series key is on
      // the parent <g> (data-bdga-series); each rect's datum carries the row in
      // d.data, so the un-stacked value is d.data[key].
      const byKey = new Map();
      stackRects.nodes().forEach((el) => {
        const sKey = el.parentNode.getAttribute('data-bdga-series');
        const d = d3.select(el).datum();
        if (!byKey.has(sKey)) byKey.set(sKey, []);
        byKey.get(sKey).push({ el, xVal: d.data[this.xKey], value: d.data[sKey] });
      });
      // Register top-to-bottom so the arrow-key direction matches the stack:
      // d3.stack puts the first key at the BOTTOM, so the last visible key is
      // the topmost band. Registering it as group 0 means ArrowUp (g-1) moves
      // to the band that is visually higher, ArrowDown to the one below.
      this.visibleKeys()
        .slice()
        .reverse()
        .forEach((key) => {
          if (byKey.has(key)) this.addPoints(key, byKey.get(key));
        });

      this.drawAxisLabels(svg, w, h, m);
    }

    /**
     * Line chart. Single-series stays one line in the primary colour; with two
     * or more y_keys it becomes a multi-series line chart where each series has
     * its own colour, a distinct marker shape (a colour-blind-safe redundant
     * cue), and a direct end-of-line label so the chart is readable without the
     * legend (UK Gov: "label lines directly"). Each series registers as its own
     * keyboard-nav group, so Up/Down move between series.
     */
    drawLine(rows) {
      const d3 = window.d3;
      const keys = this.visibleKeys();
      const multi = this.yKeys.length > 1;
      const dims = this.dims(rows);
      const { w, h, rotation } = dims;
      const m = Object.assign({}, dims.m);
      // Reserve right-margin room for the end-of-line labels when multi-series.
      if (multi) {
        const longest = keys.reduce((a, k) => Math.max(a, String(k).length), 0);
        m.right = Math.max(m.right, Math.min(160, 16 + longest * 7));
      }
      const svg = this.svgRoot(w, h);

      const x = d3
        .scalePoint()
        .domain(rows.map((r) => r[this.xKey]))
        .range([m.left, w - m.right]);
      const yMax = d3.max(rows, (r) => d3.max(keys, (k) => +r[k] || 0)) || 1;
      const y = d3.scaleLinear().domain([0, yMax]).nice().range([h - m.bottom, m.top]);

      const xAxis = svg
        .append('g')
        .attr('transform', `translate(0,${  h - m.bottom  })`)
        .call(d3.axisBottom(x));
      svg.append('g').attr('transform', `translate(${  m.left  },0)`).call(d3.axisLeft(y));
      this.rotateXLabels(xAxis, rotation);

      const palette = this.palette;
      const SYMBOLS = [
        d3.symbolCircle, d3.symbolSquare, d3.symbolTriangle,
        d3.symbolDiamond, d3.symbolStar, d3.symbolCross, d3.symbolWye,
      ];
      // Colour and marker shape key off the ORIGINAL series index so a series
      // keeps both when others are toggled off.
      const idxOf = (key) => this.yKeys.indexOf(key);
      const colorFor = (key) => {
        if (!multi) return palette.single;
        const i = idxOf(key);
        return i < palette.categorical.length ? palette.categorical[i] : shadeSequential(palette, i, this.yKeys.length);
      };
      const symbolFor = (key) => d3.symbol().type(SYMBOLS[idxOf(key) % SYMBOLS.length]).size(70)();

      keys.forEach((key) => {
        const color = colorFor(key);
        const g = svg.append('g').attr('data-bdga-series', key);
        const lineGen = d3.line().x((d) => x(d[this.xKey])).y((d) => y(+d[key] || 0));
        g.append('path')
          .attr('class', 'bdga-chart__line')
          .datum(rows)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('d', lineGen);
        const markers = g
          .selectAll('path.bdga-chart__line-marker')
          .data(rows)
          .join('path')
          .attr('class', 'bdga-chart__line-marker')
          .attr('transform', (d) => `translate(${x(d[this.xKey])},${y(+d[key] || 0)})`)
          .attr('d', symbolFor(key))
          .attr('fill', color);

        // Direct end-of-line label (multi-series only); single-series is named
        // by the Y axis already.
        if (multi && rows.length) {
          const last = rows[rows.length - 1];
          g.append('text')
            .attr('class', 'bdga-chart__line-label')
            .attr('x', x(last[this.xKey]) + 6)
            .attr('y', y(+last[key] || 0))
            .attr('dy', '0.32em')
            .attr('fill', color)
            .text(key);
        }

        this.addPoints(
          multi ? key : (this.yLabel || key),
          markers.nodes().map((el) => {
            const d = d3.select(el).datum();
            return { el, xVal: d[this.xKey], value: +d[key] || 0 };
          })
        );
      });

      this.drawAxisLabels(svg, w, h, m);
    }

    drawPie(rows) {
      const d3 = window.d3;
      const { w, h } = this.dims(null);
      const svg = this.svgRoot(w, h);
      const yKey = this.yKeys[0];
      // Reserve an outer ring for the direct slice labels (so each slice is
      // identifiable without the legend); shrink the slice radius to fit them.
      const r = Math.max(48, Math.min(w, h) / 2 - 72);

      const g = svg.append('g').attr('transform', `translate(${  w / 2  },${  h / 2  })`);
      // Pie slices are categorical: colour by ORIGINAL slice index (over the
      // full row set) so a slice keeps its colour when others are toggled off.
      // The pie layout itself runs over only the visible rows so the remaining
      // slices re-fill the circle.
      const palette = this.palette;
      const total = rows.length;
      const colorByKey = new Map();
      const idxByKey = new Map();
      rows.forEach((d, i) => {
        const k = String(d[this.xKey]);
        idxByKey.set(k, i);
        colorByKey.set(
          k,
          total <= palette.categorical.length ? palette.categorical[i] : shadeSequential(palette, i, total)
        );
      });
      const visible = rows.filter((d) => !this.hidden.has(String(d[this.xKey])));
      const sum = visible.reduce((a, d) => a + (Number(d[yKey]) || 0), 0) || 1;
      const pie = d3.pie().value((d) => d[yKey]);
      const arc = d3.arc().innerRadius(0).outerRadius(r);
      const arcs = pie(visible);

      const slices = g
        .selectAll('path.bdga-chart__pie-slice')
        .data(arcs)
        .join('path')
        .attr('class', 'bdga-chart__pie-slice')
        .attr('d', arc)
        .attr('data-bdga-series', (d) => String(d.data[this.xKey]))
        .attr('fill', (d) => {
          const k = String(d.data[this.xKey]);
          return this.fillFor(svg, idxByKey.get(k) || 0, colorByKey.get(k) || palette.single);
        })
        .attr('stroke', 'var(--ct-color-background, #fff)')
        .attr('stroke-width', 2);

      // Direct slice labels with leader lines, outside the pie (Carbon callout
      // style), so the chart reads without the legend. Decorative for AT - the
      // slice path carries the accessible label - so the label group is hidden.
      const labelArc = d3.arc().innerRadius(r + 6).outerRadius(r + 6);
      const mid = (d) => d.startAngle + (d.endAngle - d.startAngle) / 2;
      const labels = g.append('g').attr('class', 'bdga-chart__pie-labels').attr('aria-hidden', 'true');
      arcs.forEach((d) => {
        const right = mid(d) < Math.PI;
        const elbow = labelArc.centroid(d);
        const end = [(r + 28) * (right ? 1 : -1), elbow[1]];
        labels
          .append('polyline')
          .attr('class', 'bdga-chart__pie-leader')
          .attr('points', [arc.centroid(d), elbow, end].map((p) => p.join(',')).join(' '));
        const pct = Math.round(((Number(d.data[yKey]) || 0) / sum) * 100);
        labels
          .append('text')
          .attr('class', 'bdga-chart__pie-label')
          .attr('x', end[0] + (right ? 4 : -4))
          .attr('y', end[1])
          .attr('dy', '0.32em')
          .attr('text-anchor', right ? 'start' : 'end')
          .text(`${d.data[this.xKey]} (${pct}%)`);
      });

      // Slices are one navigable group; the label carries the share of the
      // whole so a screen-reader user gets the same insight a sighted user
      // reads off the wedge size.
      this.addPoints(
        null,
        slices.nodes().map((el) => {
          const d = d3.select(el).datum();
          const pct = Math.round(((Number(d.data[yKey]) || 0) / sum) * 100);
          return {
            el,
            label: Drupal.t('@x: @v, @p% of total', {
              '@x': d.data[this.xKey],
              '@v': this.formatValue(d.data[yKey]),
              '@p': pct,
            }),
          };
        })
      );
    }

    /**
     * Lollipop chart - one stem-and-dot per category. Reuses drawLine's
     * scalePoint + circle pattern but skips the connecting path. Categories
     * are coloured by the categorical palette when color_by:category is set
     * (e.g. tier colouring for the MDPR per-project view); otherwise every
     * dot is the single primary colour.
     *
     * Optional median reference line driven by this.medianValue (computed
     * server-side in chart_postprocess.inc).
     */
    drawLollipop(rows) {
      const d3 = window.d3;
      const { w, h, m, rotation } = this.dims(rows);
      const svg = this.svgRoot(w, h);
      const yKey = this.yKeys[0];

      const x = d3
        .scalePoint()
        .domain(rows.map((r) => r[this.xKey]))
        .range([m.left, w - m.right])
        .padding(0.5);
      const yMax = d3.max(rows, (r) => r[yKey]) || 1;
      const y = d3
        .scaleLinear()
        .domain([0, yMax])
        .nice()
        .range([h - m.bottom, m.top]);

      const xAxis = svg
        .append('g')
        .attr('transform', `translate(0,${  h - m.bottom  })`)
        .call(d3.axisBottom(x));
      svg.append('g').attr('transform', `translate(${  m.left  },0)`).call(d3.axisLeft(y));
      this.rotateXLabels(xAxis, rotation);

      // For lollipop the category column is conventionally a non-yKey label
      // such as "Tier"; we use it when color_by:category is enabled. With
      // no category column the chart falls back to the single primary
      // colour, which matches the MDPR figure caption "coloured by tier".
      const palette = this.palette;
      const categoryKey = (rows[0] && Object.keys(rows[0]).find((k) =>
        k !== this.xKey && k !== yKey && typeof rows[0][k] === 'string'
      )) || null;
      const categories = categoryKey
        ? Array.from(new Set(rows.map((r) => r[categoryKey])))
        : [];
      const categoryColor = categoryKey
        ? d3.scaleOrdinal().domain(categories).range(palette.categorical)
        : null;
      const dotColor = (d) => {
        if (this.colorBy === 'category' && categoryKey) {
          return categoryColor(d[categoryKey]);
        }
        return palette.single;
      };

      const stems = svg.append('g').attr('class', 'bdga-chart__lollipop-stems');
      stems
        .selectAll('line')
        .data(rows)
        .join('line')
        .attr('class', 'bdga-chart__lollipop-stem')
        .attr('x1', (d) => x(d[this.xKey]))
        .attr('x2', (d) => x(d[this.xKey]))
        .attr('y1', y(0))
        .attr('y2', (d) => y(d[yKey]));

      const dots = svg
        .append('g')
        .selectAll('circle')
        .data(rows)
        .join('circle')
        .attr('class', 'bdga-chart__lollipop-dot')
        .attr('cx', (d) => x(d[this.xKey]))
        .attr('cy', (d) => y(d[yKey]))
        .attr('r', 4)
        .attr('fill', dotColor);
      dots.append('title').text((d) => `${d[this.xKey]  }: ${  d[yKey]}`);
      this.addPoints(
        this.yLabel || yKey,
        dots.nodes().map((el) => {
          const d = d3.select(el).datum();
          return { el, xVal: d[this.xKey], value: d[yKey] };
        })
      );

      // Median reference line, drawn last so it sits above the stems.
      if (this.medianValue !== null && this.medianValue > 0) {
        const yPos = y(this.medianValue);
        svg
          .append('line')
          .attr('class', 'bdga-chart__lollipop-median')
          .attr('x1', m.left)
          .attr('x2', w - m.right)
          .attr('y1', yPos)
          .attr('y2', yPos);
        svg
          .append('text')
          .attr('class', 'bdga-chart__lollipop-median-label')
          .attr('x', w - m.right)
          .attr('y', yPos - 4)
          .attr('text-anchor', 'end')
          .text(Drupal.t('Median @v', { '@v': this.medianValue.toLocaleString() }));
      }

      this.drawAxisLabels(svg, w, h, m);
    }

    /**
     * Truncate the tick labels on a (vertical) axis group to fit a pixel
     * budget, keeping the full text in a <title> child for screen-reader and
     * hover users. Used by the Cleveland plot where category names (e.g. long
     * portfolio titles) would otherwise overrun the left margin.
     */
    truncateTickLabels(axisSel, pxBudget) {
      const maxChars = Math.max(6, Math.floor(pxBudget / 6.5));
      axisSel.selectAll('g.tick text').nodes().forEach((t) => {
        const full = t.textContent;
        if (full.length > maxChars) {
          t.textContent = `${full.slice(0, maxChars - 1)}…`;
          const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
          title.textContent = full;
          t.parentNode.appendChild(title);
        }
      });
    }

    /**
     * Cleveland dot plot - one row per category with two dots (the two
     * y-series) joined by a connector, so the reader scans year-on-year change
     * down the column. Categories run down the Y axis and the value runs along
     * the X axis; the horizontal layout keeps long category labels readable and
     * the chart usable on narrow screens, where a 16-category grouped bar would
     * be unreadable. Needs exactly two y_keys. The connecting line carries the
     * magnitude of change without a separate annotation.
     */
    drawCleveland(rows) {
      const d3 = window.d3;
      const palette = this.palette;
      const keys = (this.yKeys || []).slice(0, 2);
      if (keys.length < 2) return this.fail('Cleveland dot plot needs two y_keys');
      const w = this.canvas.clientWidth || 640;

      // Reserve left room for the category labels - up to ~38% of the canvas,
      // truncating longer names (full text stays in the dot titles + the data
      // table). Narrow containers get a smaller budget so the plot keeps a
      // usable value axis.
      const labels = rows.map((r) => String(r[this.xKey] != null ? r[this.xKey] : ''));
      const longest = labels.reduce((a, s) => Math.max(a, s.length), 0);
      const labelBudget = Math.min(Math.round(w * 0.38), Math.max(72, Math.round(longest * 6.5)));
      const m = { top: 44, right: 28, bottom: 44, left: labelBudget + 12 };

      // Height grows with the number of categories so rows never crowd.
      const rowH = 26;
      const h = m.top + m.bottom + Math.max(1, rows.length) * rowH;
      const svg = this.svgRoot(w, h);

      const y = d3
        .scaleBand()
        .domain(labels)
        .range([m.top, h - m.bottom])
        .padding(0.45);
      const xMax = d3.max(rows, (r) => Math.max(...keys.map((k) => Number(r[k]) || 0))) || 1;
      const x = d3
        .scaleLinear()
        .domain([0, xMax])
        .nice()
        .range([m.left, w - m.right]);

      svg
        .append('g')
        .attr('transform', `translate(0,${h - m.bottom})`)
        .call(d3.axisBottom(x).ticks(Math.min(8, xMax)).tickFormat(d3.format('d')));
      const yAxis = svg
        .append('g')
        .attr('transform', `translate(${m.left},0)`)
        .call(d3.axisLeft(y));
      this.truncateTickLabels(yAxis, labelBudget);

      const colorA = palette.categorical[0];
      const colorB = palette.categorical[1];
      const cy = (d) => y(String(d[this.xKey] != null ? d[this.xKey] : '')) + y.bandwidth() / 2;

      const rowG = svg
        .append('g')
        .selectAll('g')
        .data(rows)
        .join('g')
        .attr('class', 'bdga-chart__cleveland-row')
        .attr('tabindex', '0')
        .attr('role', 'img')
        .attr('aria-label', (d) => `${d[this.xKey]}: ${keys[0]} ${d[keys[0]]}, ${keys[1]} ${d[keys[1]]}`);

      rowG
        .append('line')
        .attr('class', 'bdga-chart__cleveland-connector')
        .attr('x1', (d) => x(Number(d[keys[0]]) || 0))
        .attr('x2', (d) => x(Number(d[keys[1]]) || 0))
        .attr('y1', cy)
        .attr('y2', cy);

      keys.forEach((k, i) => {
        rowG
          .append('circle')
          .attr('class', `bdga-chart__cleveland-dot bdga-chart__cleveland-dot--${i + 1}`)
          .attr('cx', (d) => x(Number(d[k]) || 0))
          .attr('cy', cy)
          .attr('r', 5)
          .attr('fill', i === 0 ? colorA : colorB)
          .append('title')
          .text((d) => `${d[this.xKey]} - ${k}: ${d[k]}`);
      });

      // Inline legend: one swatch per series, above the plot area.
      const legend = svg
        .append('g')
        .attr('class', 'bdga-chart__cleveland-legend')
        .attr('transform', `translate(${m.left},22)`);
      keys.forEach((k, i) => {
        const g = legend.append('g').attr('transform', `translate(${i * 96},0)`);
        g.append('circle').attr('r', 5).attr('cx', 5).attr('cy', -4).attr('fill', i === 0 ? colorA : colorB);
        g.append('text').attr('class', 'bdga-chart__cleveland-legend-label').attr('x', 16).attr('y', 0).text(k);
      });

      this.drawAxisLabels(svg, w, h, m);

      // The row groups are already focusable (tabindex=0) and labelled, but
      // draw() left the canvas aria-hidden, so AT could not reach them. Expose
      // the plot the same way the point-nav charts do. Cleveland uses one tab
      // stop per row (no roving arrow model), so the hint says "Tab".
      this.exposePlot(Drupal.t('Tab to each row for its values.'));
    }

    /**
     * Internal: render a sankey diagram for the given alignment.
     *
     * Colour model:
     *  - When every node id is prefixed (e.g. "2025: High", "From: X"),
     *    nodes are grouped by the suffix and each unique group is assigned
     *    a colour from palette.sequential. The same rating in every year
     *    column then renders in the same shade, matching the MDPR Fig 18
     *    style.
     *  - Without prefixes the renderer falls back to per-index categorical
     *    colouring (rainbow), which is the right answer for ad-hoc graphs
     *    where node ids carry no ordinal structure.
     *  - Link strokes inherit the source node's group colour. The CSS rule
     *    must NOT declare a stroke colour for .bdga-chart__sankey-link, or
     *    it would beat this presentation attribute on specificity and
     *    flatten every link to one hue.
     *
     * Label model:
     *  - One column header per d3-sankey depth, drawn above the column
     *    using the shared prefix (e.g. "2025"). Skipped if column nodes
     *    don't share a prefix.
     *  - Node labels show only the suffix (the rating), with text
     *    anchored outside the chart for the leftmost / rightmost columns
     *    and above the rect for middle columns to avoid overlapping the
     *    link bundles.
     *
     * d3-sankey mutates its input nodes/links in place; we shallow-clone so
     * a re-draw on resize doesn't double-mutate the originals.
     */
    drawSankeyInternal(alignFn) {
      const d3 = window.d3;
      const w = this.canvas.clientWidth || 640;
      const h = Math.min(Math.max(w * 0.55, 320), 520);
      // Side margins reserve room for the leftmost / rightmost node labels and
      // the column headers. They are CSS-var knobs switched by the @container
      // queries in chart.scss: ~140px on wide containers, tightened on narrow
      // ones (mobile, sidebars) so the columns still fit. Authors can override.
      const c = this.canvas;
      let side = cssNum(c, '--bdga-chart-sankey-margin-x', 140);
      // Hard floor independent of the knobs: never let the two columns overlap.
      // Guarantees a positive plot area even if an author sets a large margin
      // on a very narrow embed, or the container query hasn't matched yet.
      const MIN_PLOT = 80;
      if (w - side * 2 < MIN_PLOT) {
        side = Math.max(8, Math.floor((w - MIN_PLOT) / 2));
      }
      const m = {
        top: cssNum(c, '--bdga-chart-sankey-margin-top', 60),
        right: side,
        bottom: cssNum(c, '--bdga-chart-sankey-margin-bottom', 10),
        left: side,
      };
      // 'outside' places the edge-column labels left of / right of their rects
      // (needs the wide side margins above); 'stacked' places every label above
      // its rect so narrow containers don't clip the edges. Switched by the
      // @container queries in chart.scss.
      const stackedLabels = cssVar(c, '--bdga-chart-sankey-label-mode', 'outside') !== 'outside';
      const svg = this.svgRoot(w, h);

      // Split node ids into {prefix, label}. For an id "2025: High" the
      // prefix is "2025" and the label is "High"; for an id with no ": "
      // separator the prefix is "" and the label is the whole id. We pre-
      // compute this on the un-laid-out nodes so the d3-sankey nodeSort
      // and nodeAlign callbacks (which fire during layout) can see labels.
      const split = (id) => {
        const idx = id.indexOf(': ');
        return idx >= 0 ? { prefix: id.slice(0, idx), label: id.slice(idx + 2) } : { prefix: '', label: id };
      };
      const meta = new Map();
      this.nodes.forEach((n) => meta.set(n.id, split(n.id)));
      const allPrefixed = this.nodes.every((n) => meta.get(n.id).prefix !== '');

      // Stage index per prefix. Two sources, in order of trust:
      //   1. node.stage attached by buildSankeyFromCascadeRows. The
      //      cascade builder knows the column order from stageCols, so
      //      this is the canonical answer for URL-mode flow charts and
      //      it's independent of which row happens to be first non-null.
      //   2. Encounter order on input nodes. For JSON-mode authors who
      //      hand-write a node array in stage order, this still produces
      //      the right layout.
      const stageIndex = new Map();
      this.nodes.forEach((n) => {
        const p = meta.get(n.id).prefix;
        if (!p) return;
        if (typeof n.stage === 'number' && !stageIndex.has(p)) {
          stageIndex.set(p, n.stage);
        }
      });
      this.nodes.forEach((n) => {
        const p = meta.get(n.id).prefix;
        if (p && !stageIndex.has(p)) {
          stageIndex.set(p, stageIndex.size);
        }
      });

      // Custom alignment: when every node has a known prefix, force each
      // into its stage's column regardless of upstream connectivity. This
      // fixes the case where a row like {y1: null, y2: 'X', y3: 'Y'}
      // produces a y2 node with no incoming link - d3-sankey's default
      // justify alignment would demote it to column 0 and mix prefixes,
      // which blanks out the column header logic below. Fall back to the
      // requested alignment (justify by default) for unprefixed graphs.
      const fallbackAlign = alignFn || d3.sankeyJustify;
      const customAlign = allPrefixed && stageIndex.size >= 2
        ? (node, n) => {
            if (typeof node.stage === 'number') return node.stage;
            const p = meta.get(node.id).prefix;
            const i = stageIndex.get(p);
            return i !== undefined ? i : fallbackAlign(node, n);
          }
        : fallbackAlign;

      const sankeyGen = d3
        .sankey()
        .nodeId((d) => d.id)
        .nodeAlign(customAlign)
        .nodeWidth(14)
        .nodePadding(12)
        .extent([
          [m.left, m.top],
          [w - m.right, h - m.bottom],
        ])
        // Vertical order within each column: rank known ordinals (High at
        // the top, Not Reported at the bottom) and leave unknown labels
        // in encounter order. Passing null would disable d3-sankey's own
        // crossing-minimisation entirely; this comparator only reshuffles
        // among the ranked labels.
        .nodeSort((a, b) => compareByRank(meta.get(a.id).label, meta.get(b.id).label));

      const nodes = this.nodes.map((n) => Object.assign({}, n));
      const links = this.links.map((l) => Object.assign({}, l));
      const graph = sankeyGen({ nodes, links });

      const palette = this.palette;
      // Muted neutral for "Not reported" / "Unable to rate" so they fall
      // off the rank ramp visually. Comes from a sankey-specific CSS
      // variable so themes can tune it without touching the JS.
      const mutedColour = cssVar(this.root, '--bdga-chart-sankey-muted', '#a8a8a8');
      let colourForNode;
      if (allPrefixed) {
        // Collect the unique suffixes in encounter order, then sort them
        // by ordinal rank so known categories (High..Not Reported) own
        // the head of the sequential ramp and pick up the darkest shades.
        // Unknown labels keep encounter order and fill the tail. Ranks
        // 5+ (Not reported / Unable to rate) are pulled out of the ramp
        // and rendered as muted grey, matching the MDPR Fig 18 treatment
        // where reporting gaps read as desaturated.
        const isMutedLabel = (label) => {
          const r = rankOf(label);
          return r !== null && r >= 5;
        };
        const seen = new Set();
        const encounterOrder = [];
        graph.nodes.forEach((n) => {
          const key = meta.get(n.id).label;
          if (!seen.has(key) && !isMutedLabel(key)) {
            seen.add(key);
            encounterOrder.push(key);
          }
        });
        const ordered = encounterOrder.slice().sort(compareByRank);
        const groupIndex = new Map();
        ordered.forEach((key, i) => groupIndex.set(key, i));
        const totalGroups = ordered.length;
        colourForNode = (n) => {
          const label = meta.get(n.id).label;
          if (isMutedLabel(label)) return mutedColour;
          const i = groupIndex.get(label);
          if (i === undefined) return palette.single;
          return i < palette.sequential.length
            ? palette.sequential[i]
            : shadeSequential(palette, i, totalGroups);
        };
      }
      else {
        colourForNode = (n, i) =>
          i < palette.categorical.length
            ? palette.categorical[i]
            : shadeSequential(palette, i, graph.nodes.length);
      }

      const colorByNode = new Map();
      graph.nodes.forEach((n, i) => colorByNode.set(n.id, colourForNode(n, i)));

      // Column headers: one per d.layer (the column index actually set
      // by nodeAlign), positioned above the column's first node. Skip
      // when nodes in the column don't share a prefix. Note that d.depth
      // is the topological longest-path distance from a source, which
      // is NOT the column for graphs with leading-null cascades; we
      // must read d.layer here or 2024 would land in the wrong slot.
      const headers = new Map();
      graph.nodes.forEach((n) => {
        const p = meta.get(n.id).prefix;
        if (!p) return;
        if (!headers.has(n.layer)) {
          headers.set(n.layer, { x: (n.x0 + n.x1) / 2, prefix: p });
        }
        else if (headers.get(n.layer).prefix !== p) {
          // Mixed prefixes in a column - leave the header off rather
          // than guess. Marker '' tells the render step to skip.
          headers.set(n.layer, { x: 0, prefix: '' });
        }
      });
      // Column headers and link bands are decorative for AT: the per-node
      // labels (added below) carry the meaning, so hide these to avoid noise.
      const headerGroup = svg.append('g').attr('aria-hidden', 'true');
      headers.forEach((meta_) => {
        if (!meta_.prefix) return;
        headerGroup
          .append('text')
          .attr('class', 'bdga-chart__sankey-column-header')
          .attr('x', meta_.x)
          .attr('y', m.top - 20)
          .attr('text-anchor', 'middle')
          .text(meta_.prefix);
      });

      // Flow label shared by the native <title> (non-JS / fallback) and the
      // comparative tooltip shown on hover - source → target with the value,
      // the way Carbon labels an emphasised flow.
      const flowLabel = (d) => {
        let base = `${d.source.id} → ${d.target.id}: ${this.formatValue(d.value)}`;
        if (typeof d.budget === 'number') {
          base += ` ($${d.budget.toFixed(2)}B)`;
        }
        return base;
      };

      // Links underneath the node rects so they appear to plug in. Each is a
      // hover-emphasis target (data-bdga-link) carrying its comparative label;
      // the group stays aria-hidden so flows reach AT once, through the table.
      const linkGroup = svg.append('g').attr('fill', 'none').attr('aria-hidden', 'true');
      linkGroup
        .selectAll('path')
        .data(graph.links)
        .join('path')
        .attr('class', 'bdga-chart__sankey-link')
        .attr('data-bdga-link', '')
        .attr('aria-label', flowLabel)
        .attr('d', d3.sankeyLinkHorizontal())
        .attr('stroke', (d) => colorByNode.get(d.source.id) || palette.single)
        .attr('stroke-width', (d) => Math.max(1, d.width))
        .append('title')
        .text(flowLabel);

      // Column count for placement decisions. d.layer is the column
      // index set by nodeAlign above; d.depth would be topology and
      // would mis-classify nodes whose chains started mid-cascade.
      const maxLayer = d3.max(graph.nodes, (n) => n.layer);
      const nodeGroup = svg
        .append('g')
        .selectAll('g')
        .data(graph.nodes)
        .join('g')
        .attr('class', 'bdga-chart__sankey-node');

      nodeGroup
        .append('rect')
        .attr('x', (d) => d.x0)
        .attr('y', (d) => d.y0)
        .attr('width', (d) => Math.max(1, d.x1 - d.x0))
        .attr('height', (d) => Math.max(1, d.y1 - d.y0))
        .attr('fill', (d) => colorByNode.get(d.id) || palette.single)
        .append('title')
        .text((d) => `${d.name || d.id  }: ${  d.value}`);

      // Label placement, keyed off d.layer so it tracks the column index
      // actually used by the layout. Two modes (see stackedLabels above):
      //   outside (wide containers):
      //     layer 0            -> outside the rect on its left
      //     layer === maxLayer -> outside the rect on its right
      //     middle columns     -> centred above the rect
      //   stacked (narrow containers): every label sits above its rect, with
      //     the edge columns anchored to their inner side so they read inward
      //     and never spill past the canvas edge.
      // Multi-stage flows use the column header for the stage label, so
      // each node's own text is just its suffix (e.g. "Medium-High").
      const isEdge = (d) => d.layer === 0 || d.layer === maxLayer;
      nodeGroup
        .append('text')
        .attr('text-anchor', (d) => {
          if (stackedLabels) {
            if (d.layer === 0) return 'start';
            if (d.layer === maxLayer) return 'end';
            return 'middle';
          }
          if (d.layer === 0) return 'end';
          if (d.layer === maxLayer) return 'start';
          return 'middle';
        })
        .attr('x', (d) => {
          if (stackedLabels) {
            if (d.layer === 0) return d.x0;
            if (d.layer === maxLayer) return d.x1;
            return (d.x0 + d.x1) / 2;
          }
          if (d.layer === 0) return d.x0 - 6;
          if (d.layer === maxLayer) return d.x1 + 6;
          return (d.x0 + d.x1) / 2;
        })
        .attr('y', (d) => {
          if (!stackedLabels && isEdge(d)) return (d.y0 + d.y1) / 2;
          return d.y0 - 4;
        })
        .attr('dy', (d) => (!stackedLabels && isEdge(d) ? '0.35em' : '0'))
        .text((d) => meta.get(d.id).label);

      // Keyboard navigation: each node group is a focusable, labelled point.
      // role="img" (set by addPoints) makes the group a leaf for AT, so its
      // rect / text / title are not announced separately; with the links and
      // headers aria-hidden, a screen reader hears one clear label per node.
      // Nodes are a single nav group - Left/Right and Home/End move through
      // them in layout order.
      this.addPoints(
        null,
        nodeGroup.nodes().map((el) => {
          const d = d3.select(el).datum();
          const incoming = (d.targetLinks || []).length;
          const outgoing = (d.sourceLinks || []).length;
          const parts = [];
          if (incoming) parts.push(Drupal.t('@n in', { '@n': incoming }));
          if (outgoing) parts.push(Drupal.t('@n out', { '@n': outgoing }));
          const flows = parts.length ? `. ${parts.join(', ')}` : '';
          return { el, label: `${d.name || d.id}: ${this.formatValue(d.value)}${flows}` };
        })
      );
    }

    /**
     * Sankey - left-to-right flow diagram. Uses d3.sankeyJustify so the
     * leftmost column is anchored at x=0 and rightmost at x=width, which
     * matches the MDPR Figure 18 DCA flow layout.
     */
    drawSankey() {
      this.drawSankeyInternal(window.d3.sankeyJustify);
    }

    /**
     * Flow - multi-stage alluvial diagram (e.g. 2024 -> 2025 -> 2026).
     * Same renderer as sankey; the data shape declares the staging via
     * node ordering, and the d3-sankey layout handles the rest. Kept as a
     * separate type so authors / templates can style it differently, but
     * the visual difference is currently only via CSS hooks.
     */
    drawFlow() {
      this.drawSankeyInternal(window.d3.sankeyJustify);
    }
  }
})(window.Drupal, window.once);

// Static-page driver. Drupal core runs Drupal.attachBehaviors() after page
// load + each AJAX swap; without it, the bdgaChart behaviour above is
// registered but never attached. Run it on DOMContentLoaded and on every
// DOM mutation so async-rendered story canvases still trigger. once() inside
// the behaviour deduplicates, so repeated calls are cheap.
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
