(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.bdgaChartData = {}));
})(this, (function(exports2) {
  "use strict";
  const ALLOWED_HOSTS = ["data.gov.au", "www.data.gov.au"];
  const MAX_ROWS = 5e3;
  const MAX_CELL_CHARS = 500;
  const MAX_PAYLOAD_BYTES = 256 * 1024;
  const FETCH_TIMEOUT_MS = 1e4;
  const PHP8_NUMERIC = /^[ \t\n\r\v\f]*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?[ \t\n\r\v\f]*$/;
  function isNumeric(value) {
    if (typeof value === "number") return Number.isFinite(value);
    if (typeof value !== "string") return false;
    return PHP8_NUMERIC.test(value);
  }
  const TEMPORAL_KEYS = /* @__PURE__ */ new Set([
    "year",
    "years",
    "fy",
    "fiscal_year",
    "financial_year",
    "reporting_year",
    "date",
    "datetime",
    "timestamp",
    "month",
    "quarter",
    "period"
  ]);
  const isTemporal = (header) => TEMPORAL_KEYS.has(String(header).trim().toLowerCase());
  function autodetectKeys(records) {
    const sample = records && records[0] || {};
    const headers = Object.keys(sample);
    let xKey = null;
    for (const h of headers) {
      if (!isNumeric(sample[h]) || isTemporal(h)) {
        xKey = h;
        break;
      }
    }
    if (xKey === null) xKey = headers[0] ?? "";
    const numeric = [];
    const numericTemporal = [];
    for (const h of headers) {
      if (h === xKey) continue;
      if (isNumeric(sample[h])) {
        (isTemporal(h) ? numericTemporal : numeric).push(h);
      }
    }
    let yKeys = numeric;
    if (!yKeys.length && numericTemporal.length) yKeys = numericTemporal;
    if (!yKeys.length) yKeys = headers.filter((h) => h !== xKey);
    return { x_key: xKey, y_keys: yKeys };
  }
  function validate(records, keys = {}) {
    const columns = new Set(Object.keys(records && records[0] || {}));
    const list = [...columns].join(", ");
    const errors = [];
    const xKey = keys.x_key ?? "";
    const yKeys = keys.y_keys ?? [];
    if (xKey && !columns.has(xKey)) errors.push(`X key "${xKey}" not in columns: ${list}`);
    for (const y of yKeys) {
      if (y && !columns.has(y)) errors.push(`Y key "${y}" not in columns: ${list}`);
    }
    return errors;
  }
  function validateSourceUrl(raw) {
    const value = String(raw ?? "").trim();
    if (value === "") return { ok: false, host: "", error: "Empty URL" };
    if (value.length > 2048) return { ok: false, host: "", error: "URL exceeds 2048 chars" };
    let url;
    try {
      url = new URL(value);
    } catch {
      return { ok: false, host: "", error: "Malformed URL" };
    }
    if (url.protocol !== "https:") return { ok: false, host: "", error: "Scheme must be https" };
    const host = url.hostname.toLowerCase();
    if (!ALLOWED_HOSTS.includes(host)) return { ok: false, host, error: `Host not on allowlist: ${host}` };
    if (url.username || url.password) return { ok: false, host, error: "Credentials in URL not permitted" };
    return { ok: true, host, error: "" };
  }
  function sanitiseRecords(rawRecords) {
    const out = [];
    for (const r of rawRecords) {
      if (out.length >= MAX_ROWS) break;
      if (!r || typeof r !== "object" || Array.isArray(r)) continue;
      const row = {};
      for (const k of Object.keys(r)) {
        const v = r[k];
        if (v === null || v === void 0) {
          row[k] = "";
          continue;
        }
        if (typeof v === "object") continue;
        const s = String(v);
        row[k] = s.length > MAX_CELL_CHARS ? `${s.slice(0, MAX_CELL_CHARS)}…` : s;
      }
      out.push(row);
    }
    return out;
  }
  function deriveFields(ckanFields, records) {
    if (Array.isArray(ckanFields) && ckanFields.length) {
      return ckanFields.filter((f) => f && typeof f.id === "string").map((f) => ({ id: f.id, type: typeof f.type === "string" ? f.type : null }));
    }
    return Object.keys(records[0] || {}).map((id) => ({ id, type: null }));
  }
  async function fetchRecords(url, { fetchImpl, timeoutMs = FETCH_TIMEOUT_MS } = {}) {
    const check = validateSourceUrl(url);
    if (!check.ok) throw new Error(check.error);
    const doFetch = fetchImpl || (typeof fetch !== "undefined" ? fetch : null);
    if (!doFetch) throw new Error("No fetch implementation available");
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    let payload;
    try {
      const res = await doFetch(new URL(String(url).trim()).toString(), {
        method: "GET",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        mode: "cors",
        signal: controller ? controller.signal : void 0,
        headers: { Accept: "application/json" }
      });
      if (timer) clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      if (ct.indexOf("application/json") === -1) throw new Error(`Unexpected content-type: ${ct}`);
      payload = await res.json();
    } catch (err) {
      if (timer) clearTimeout(timer);
      if (err instanceof Error && /^(HTTP |Unexpected content-type)/.test(err.message)) throw err;
      throw new Error(`Fetch failed: ${err && err.message ? err.message : err}`, { cause: err });
    }
    const rawRecords = payload && payload.result && Array.isArray(payload.result.records) ? payload.result.records : Array.isArray(payload) ? payload : [];
    const records = sanitiseRecords(rawRecords);
    const fields = deriveFields(payload && payload.result ? payload.result.fields : null, records);
    return { records, fields };
  }
  function splitCsvLine(line) {
    const out = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  }
  function parseCsvToRecords(text) {
    const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim() !== "");
    if (lines.length < 2) throw new Error("CSV needs a header row and at least one data row");
    const headers = splitCsvLine(lines[0]).map((h) => h.trim());
    const records = [];
    for (let i = 1; i < lines.length && records.length < MAX_ROWS; i += 1) {
      const cells = splitCsvLine(lines[i]);
      const row = {};
      headers.forEach((h, idx) => {
        const cell = (cells[idx] ?? "").trim();
        row[h] = cell.length > MAX_CELL_CHARS ? `${cell.slice(0, MAX_CELL_CHARS)}…` : cell;
      });
      records.push(row);
    }
    return { records, headers };
  }
  function parseJsonToRecords(text) {
    let decoded;
    try {
      decoded = JSON.parse(text);
    } catch (cause) {
      throw new Error("Invalid JSON", { cause });
    }
    let raw = null;
    if (Array.isArray(decoded)) raw = decoded;
    else if (decoded && Array.isArray(decoded.rows)) raw = decoded.rows;
    else if (decoded && decoded.result && Array.isArray(decoded.result.records)) raw = decoded.result.records;
    if (!Array.isArray(raw) || !raw.length) throw new Error("No row array found in JSON");
    const records = sanitiseRecords(raw);
    return { records, headers: Object.keys(records[0] || {}) };
  }
  function parse(text, mode) {
    const input = String(text ?? "");
    if (input.length > MAX_PAYLOAD_BYTES) throw new Error("Payload exceeds size cap");
    let result;
    if (mode === "csv") result = parseCsvToRecords(input);
    else if (mode === "json") result = parseJsonToRecords(input);
    else throw new Error(`Unknown parse mode: ${mode}`);
    return { records: result.records, fields: result.headers.map((id) => ({ id, type: null })) };
  }
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = (s) => typeof s === "string" && UUID_RE.test(s);
  function extractResourceId(url) {
    let parsed;
    try {
      parsed = new URL(String(url ?? "").trim());
    } catch {
      return null;
    }
    const rid = parsed.searchParams.get("resource_id");
    if (rid && isUuid(rid)) return rid.toLowerCase();
    const sql = parsed.searchParams.get("sql");
    const fromMatch = sql && sql.match(/FROM\s+"?([0-9a-fA-F-]{36})"?/);
    if (fromMatch && isUuid(fromMatch[1])) return fromMatch[1].toLowerCase();
    const pathMatch = parsed.pathname.match(/\/resource\/([0-9a-fA-F-]{36})/);
    if (pathMatch && isUuid(pathMatch[1])) return pathMatch[1].toLowerCase();
    return null;
  }
  async function resolveSourcePage(url, { fetchImpl, timeoutMs = FETCH_TIMEOUT_MS } = {}) {
    if (!validateSourceUrl(url).ok) return null;
    const resourceId = extractResourceId(url);
    if (!resourceId) return null;
    const doFetch = fetchImpl || (typeof fetch !== "undefined" ? fetch : null);
    if (!doFetch) return null;
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const encId = encodeURIComponent(resourceId);
      const api = `https://data.gov.au/data/api/3/action/resource_show?id=${encId}`;
      const res = await doFetch(api, {
        method: "GET",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        mode: "cors",
        signal: controller ? controller.signal : void 0,
        headers: { Accept: "application/json" }
      });
      if (timer) clearTimeout(timer);
      if (!res.ok) return null;
      const data = await res.json();
      const packageId = data && data.result && data.result.package_id;
      if (!isUuid(packageId)) return null;
      const encPkg = encodeURIComponent(packageId);
      const landingUrl = `https://data.gov.au/data/dataset/${encPkg}/resource/${encId}`;
      return { landingUrl, resourceId, packageId: packageId.toLowerCase() };
    } catch {
      if (timer) clearTimeout(timer);
      return null;
    }
  }
  exports2.ALLOWED_HOSTS = ALLOWED_HOSTS;
  exports2.FETCH_TIMEOUT_MS = FETCH_TIMEOUT_MS;
  exports2.MAX_CELL_CHARS = MAX_CELL_CHARS;
  exports2.MAX_PAYLOAD_BYTES = MAX_PAYLOAD_BYTES;
  exports2.MAX_ROWS = MAX_ROWS;
  exports2.autodetectKeys = autodetectKeys;
  exports2.extractResourceId = extractResourceId;
  exports2.fetchRecords = fetchRecords;
  exports2.isNumeric = isNumeric;
  exports2.parse = parse;
  exports2.resolveSourcePage = resolveSourcePage;
  exports2.validate = validate;
  exports2.validateSourceUrl = validateSourceUrl;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
}));
