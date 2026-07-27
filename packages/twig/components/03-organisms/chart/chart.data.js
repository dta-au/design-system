/**
 * Chart data core - framework-agnostic.
 *
 * Pure data helpers shared by the chart renderer (chart.js) and the bdga
 * paragraph editor. No DOM, no D3, no Drupal. Authored as ESM; built to
 * ESM + UMD so the editor's plain-JS admin library can load it too.
 *
 * Parity contract: isNumeric / autodetectKeys / validate mirror the PHP
 * save-time parsers in bdga (chart_postprocess.inc). Pinned by
 * tests/fixtures/chart_data_parity.json - PHP-generated, the authority.
 * Keep both sides green when editing these three.
 */

export const ALLOWED_HOSTS = ['data.gov.au', 'www.data.gov.au'];
export const MAX_ROWS = 5000;
export const MAX_CELL_CHARS = 500;
export const MAX_PAYLOAD_BYTES = 256 * 1024;
export const FETCH_TIMEOUT_MS = 10000;

// Port of PHP 8 is_numeric(). PHP 8 accepts leading AND trailing whitespace;
// rejects thousands separators, hex/binary/underscore literals, and the bare
// strings "INF"/"NAN". JSON numbers arrive as real numbers, hence the Number
// branch.
const PHP8_NUMERIC = /^[ \t\n\r\v\f]*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?[ \t\n\r\v\f]*$/;
export function isNumeric(value) {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'string') return false;
  return PHP8_NUMERIC.test(value);
}

// Columns treated as the category axis even when numeric: a year is a label,
// not a measurement. Exact match after trim + lowercase, not substring.
const TEMPORAL_KEYS = new Set([
  'year', 'years', 'fy', 'fiscal_year', 'financial_year', 'reporting_year',
  'date', 'datetime', 'timestamp', 'month', 'quarter', 'period',
]);
const isTemporal = (header) => TEMPORAL_KEYS.has(String(header).trim().toLowerCase());

/**
 * Pick the X (category) and Y (series) keys from a record set, mirroring
 * _bdga_chart_autodetect. records[0] is the type sample. X = first
 * non-numeric-or-temporal header (else the first header); Y = the remaining
 * numeric non-temporal headers, falling back to numeric temporal headers,
 * then to every non-X header.
 */
export function autodetectKeys(records) {
  const sample = (records && records[0]) || {};
  const headers = Object.keys(sample);
  let xKey = null;
  for (const h of headers) {
    if (!isNumeric(sample[h]) || isTemporal(h)) { xKey = h; break; }
  }
  if (xKey === null) xKey = headers[0] ?? '';

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

/**
 * Data-level validation, mirroring what the PHP parsers reject at save: a
 * non-empty chosen key absent from the data. Non-numeric Y values are NOT an
 * error - PHP coerces them to 0, so callers surface that as a warning, not a
 * save-blocker. `keys` is the autodetectKeys shape ({ x_key, y_keys }).
 * Returns [] when clean.
 */
export function validate(records, keys = {}) {
  const columns = new Set(Object.keys((records && records[0]) || {}));
  const list = [...columns].join(', ');
  const errors = [];
  const xKey = keys.x_key ?? '';
  const yKeys = keys.y_keys ?? [];
  if (xKey && !columns.has(xKey)) errors.push(`X key "${xKey}" not in columns: ${list}`);
  for (const y of yKeys) {
    if (y && !columns.has(y)) errors.push(`Y key "${y}" not in columns: ${list}`);
  }
  return errors;
}

/**
 * Validate an author-supplied data.gov.au URL the way bdga does server-side
 * (_bdga_chart_validate_url): https only, host on the allowlist, length cap,
 * no embedded credentials. Returns { ok, host, error }; never throws.
 */
export function validateSourceUrl(raw) {
  const value = String(raw ?? '').trim();
  if (value === '') return { ok: false, host: '', error: 'Empty URL' };
  if (value.length > 2048) return { ok: false, host: '', error: 'URL exceeds 2048 chars' };
  let url;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, host: '', error: 'Malformed URL' };
  }
  if (url.protocol !== 'https:') return { ok: false, host: '', error: 'Scheme must be https' };
  const host = url.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.includes(host)) return { ok: false, host, error: `Host not on allowlist: ${host}` };
  if (url.username || url.password) return { ok: false, host, error: 'Credentials in URL not permitted' };
  return { ok: true, host, error: '' };
}

// Sanitise raw records into flat { string: string } rows: drop nested
// objects/arrays, coerce scalars to strings, cap each cell and the row count.
// Numeric coercion of Y columns happens later in the renderer once keys are
// resolved - the editor needs raw values to suggest keys.
function sanitiseRecords(rawRecords) {
  const out = [];
  for (const r of rawRecords) {
    if (out.length >= MAX_ROWS) break;
    if (!r || typeof r !== 'object' || Array.isArray(r)) continue;
    const row = {};
    for (const k of Object.keys(r)) {
      const v = r[k];
      if (v === null || v === undefined) { row[k] = ''; continue; }
      if (typeof v === 'object') continue;
      const s = String(v);
      row[k] = s.length > MAX_CELL_CHARS ? `${s.slice(0, MAX_CELL_CHARS)}…` : s;
    }
    out.push(row);
  }
  return out;
}

// CKAN gives a typed field list (result.fields = [{ id, type }]); prefer it so
// the editor can suggest by type. Fall back to the first record's keys.
function deriveFields(ckanFields, records) {
  if (Array.isArray(ckanFields) && ckanFields.length) {
    return ckanFields
      .filter((f) => f && typeof f.id === 'string')
      .map((f) => ({ id: f.id, type: typeof f.type === 'string' ? f.type : null }));
  }
  return Object.keys(records[0] || {}).map((id) => ({ id, type: null }));
}

/**
 * Fetch + sanitise records from a data.gov.au CKAN endpoint. Returns
 * { records, fields }; fields carries CKAN's typed column list when present
 * (the renderer's old extractCkanRows dropped it). Throws Error(message) on
 * any failure so callers can surface the message. Network, so not covered by
 * the parity fixtures. `fetchImpl` is injectable for tests.
 */
export async function fetchRecords(url, { fetchImpl, timeoutMs = FETCH_TIMEOUT_MS } = {}) {
  const check = validateSourceUrl(url);
  if (!check.ok) throw new Error(check.error);
  const doFetch = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!doFetch) throw new Error('No fetch implementation available');

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  let payload;
  try {
    const res = await doFetch(new URL(String(url).trim()).toString(), {
      method: 'GET',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      mode: 'cors',
      signal: controller ? controller.signal : undefined,
      headers: { Accept: 'application/json' },
    });
    if (timer) clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (ct.indexOf('application/json') === -1) throw new Error(`Unexpected content-type: ${ct}`);
    payload = await res.json();
  } catch (err) {
    if (timer) clearTimeout(timer);
    if (err instanceof Error && /^(HTTP |Unexpected content-type)/.test(err.message)) throw err;
    throw new Error(`Fetch failed: ${err && err.message ? err.message : err}`, { cause: err });
  }

  const rawRecords = payload && payload.result && Array.isArray(payload.result.records)
    ? payload.result.records
    : (Array.isArray(payload) ? payload : []);
  const records = sanitiseRecords(rawRecords);
  const fields = deriveFields(payload && payload.result ? payload.result.fields : null, records);
  return { records, fields };
}

// Quote-aware single-line CSV split: handles embedded commas and "" escapes.
// Embedded newlines inside quoted fields are not supported (rare in CKAN
// tabular exports); the renderer falls back to the server-rendered table.
function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i += 1; } else { inQuotes = false; }
      } else { cur += ch; }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseCsvToRecords(text) {
  const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) throw new Error('CSV needs a header row and at least one data row');
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const records = [];
  for (let i = 1; i < lines.length && records.length < MAX_ROWS; i += 1) {
    const cells = splitCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      const cell = (cells[idx] ?? '').trim();
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
    throw new Error('Invalid JSON', { cause });
  }
  let raw = null;
  if (Array.isArray(decoded)) raw = decoded;
  else if (decoded && Array.isArray(decoded.rows)) raw = decoded.rows;
  else if (decoded && decoded.result && Array.isArray(decoded.result.records)) raw = decoded.result.records;
  if (!Array.isArray(raw) || !raw.length) throw new Error('No row array found in JSON');
  const records = sanitiseRecords(raw);
  return { records, headers: Object.keys(records[0] || {}) };
}

/**
 * Parse author-pasted CSV or JSON into { records, fields }. Mirrors the shapes
 * the PHP parsers accept (CSV header + rows; JSON array, { rows }, or CKAN
 * { result: { records } }). Key resolution is the caller's job via
 * autodetectKeys; this only produces records + the column list. Throws
 * Error(message) on malformed input.
 */
export function parse(text, mode) {
  const input = String(text ?? '');
  if (input.length > MAX_PAYLOAD_BYTES) throw new Error('Payload exceeds size cap');
  let result;
  if (mode === 'csv') result = parseCsvToRecords(input);
  else if (mode === 'json') result = parseJsonToRecords(input);
  else throw new Error(`Unknown parse mode: ${mode}`);
  return { records: result.records, fields: result.headers.map((id) => ({ id, type: null })) };
}

// Canonical 8-4-4-4-12 hex UUID, matching bdga's PHP _bdga_chart_is_uuid.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_RE.test(s);

/**
 * Extract the CKAN resource_id (a UUID) from a data.gov.au data URL. Handles
 * the three shapes authors paste: ?resource_id=<uuid>, a datastore_search_sql
 * ?sql=... FROM "<uuid>", and a resource page .../resource/<uuid>. Returns the
 * lower-cased UUID, or null when none is found. Mirrors the removed PHP
 * _bdga_chart_extract_resource_id.
 */
export function extractResourceId(url) {
  let parsed;
  try {
    parsed = new URL(String(url ?? '').trim());
  } catch {
    return null;
  }
  const rid = parsed.searchParams.get('resource_id');
  if (rid && isUuid(rid)) return rid.toLowerCase();
  const sql = parsed.searchParams.get('sql');
  const fromMatch = sql && sql.match(/FROM\s+"?([0-9a-fA-F-]{36})"?/);
  if (fromMatch && isUuid(fromMatch[1])) return fromMatch[1].toLowerCase();
  const pathMatch = parsed.pathname.match(/\/resource\/([0-9a-fA-F-]{36})/);
  if (pathMatch && isUuid(pathMatch[1])) return pathMatch[1].toLowerCase();
  return null;
}

/**
 * Resolve a data.gov.au datastore URL to its human resource landing page,
 * client-side (GovCMS bans server-side outbound HTTP). Editor-only: the
 * renderer just displays the stored source_page_url prop. Returns
 * { landingUrl, resourceId, packageId }, or null on any failure (not a
 * data.gov.au URL, no resource_id, resource_show fails, or no valid
 * package_id). Best-effort, so the editor shows no suggestion when null.
 * Mirrors the removed PHP _bdga_chart_resolve_source_page. `fetchImpl` is
 * injectable for tests.
 */
export async function resolveSourcePage(url, { fetchImpl, timeoutMs = FETCH_TIMEOUT_MS } = {}) {
  if (!validateSourceUrl(url).ok) return null;
  const resourceId = extractResourceId(url);
  if (!resourceId) return null;
  const doFetch = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!doFetch) return null;

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const encId = encodeURIComponent(resourceId);
    const api = `https://data.gov.au/data/api/3/action/resource_show?id=${encId}`;
    const res = await doFetch(api, {
      method: 'GET',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      mode: 'cors',
      signal: controller ? controller.signal : undefined,
      headers: { Accept: 'application/json' },
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
