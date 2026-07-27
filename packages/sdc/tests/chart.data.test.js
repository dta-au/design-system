import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { isNumeric, autodetectKeys, validate, parse, extractResourceId } from '../components/03-organisms/chart/chart.data.js';

// PHP-generated fixtures (bdga chart_data_parity.json) are the save-time
// authority; the bdga PHPUnit runner asserts the same file. Drift on either
// side fails CI. See chart.data.js parity contract.
const here = dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(
  readFileSync(join(here, 'fixtures', 'chart_data_parity.json'), 'utf8'),
);

describe('chart.data parity with PHP (chart_data_parity.json)', () => {
  test.each(fixtures.is_numeric)('is_numeric $#: $value -> $expect', (c) => {
    expect(isNumeric(c.value)).toBe(c.expect);
  });

  test.each(fixtures.autodetect)('autodetect $#', (c) => {
    expect(autodetectKeys(c.records)).toEqual(c.expect);
  });

  test.each(fixtures.key_absent)('key_absent / validate $#', (c) => {
    const { records } = parse(c.csv, 'csv');
    const errors = validate(records, { x_key: c.x_hint, y_keys: c.y_hint });
    expect(errors.length > 0).toBe(c.expect_error);
  });
});

// extractResourceId is now the canonical resource-id parser (the PHP path was
// removed in bdga 5bbdc526), and the renderer's CKAN fetch leans on it - so it
// gets a JS-side unit test on the three URL shapes authors paste.
describe('extractResourceId', () => {
  const UUID = '37c7bae2-990d-47e8-bf15-4159a5adc264';
  test.each([
    [`https://data.gov.au/x?resource_id=${UUID}`, UUID],
    [`https://data.gov.au/x?sql=SELECT * FROM "${UUID}"`, UUID],
    [`https://data.gov.au/data/dataset/p/resource/${UUID}`, UUID],
    [`https://data.gov.au/x?resource_id=${UUID.toUpperCase()}`, UUID],
    ['https://data.gov.au/x?resource_id=not-a-uuid', null],
    ['https://example.com/foo', null],
    ['not a url', null],
  ])('extractResourceId %#', (url, expected) => {
    expect(extractResourceId(url)).toBe(expected);
  });
});
