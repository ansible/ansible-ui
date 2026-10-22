/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { HostMetric } from '../../../interfaces/HostMetric';
import { escapeCsvValue, hostMetricsToCsv, withHostMetricsPagination } from './hostMetricsCsv';

function makeHost(overrides: Partial<HostMetric> = {}): HostMetric {
  return {
    id: 1,
    hostname: 'host.example.com',
    url: '/api/v2/host_metrics/1/',
    first_automation: '2024-01-01T00:00:00.000Z',
    last_automation: '2024-06-01T12:00:00.000Z',
    last_deleted: '',
    automated_counter: 42,
    deleted_counter: 0,
    deleted: false,
    used_in_inventories: 1,
    ...overrides,
  };
}

describe('escapeCsvValue', () => {
  it('should return empty string for nullish values', () => {
    expect(escapeCsvValue(null)).toBe('');
    expect(escapeCsvValue(undefined)).toBe('');
  });

  it('should leave plain values unchanged', () => {
    expect(escapeCsvValue('host1')).toBe('host1');
    expect(escapeCsvValue(42)).toBe('42');
  });

  it('should quote and escape values with commas, quotes, or newlines', () => {
    expect(escapeCsvValue('a,b')).toBe('"a,b"');
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvValue('line1\nline2')).toBe('"line1\nline2"');
  });

  it('should neutralize spreadsheet formula injection prefixes', () => {
    expect(escapeCsvValue('=cmd')).toBe("'=cmd");
    expect(escapeCsvValue('+1')).toBe("'+1");
    expect(escapeCsvValue('-1')).toBe("'-1");
    expect(escapeCsvValue('@sum')).toBe("'@sum");
  });
});

describe('hostMetricsToCsv', () => {
  it('should include the required header and one row per host', () => {
    const csv = hostMetricsToCsv([
      makeHost({ hostname: 'alpha', automated_counter: 3 }),
      makeHost({
        id: 2,
        hostname: 'beta,prod',
        first_automation: '2023-01-01T00:00:00.000Z',
        last_automation: '2023-02-01T00:00:00.000Z',
        automated_counter: 1,
      }),
    ]);

    expect(csv).toBe(
      [
        'Hostname,First Automated Date,Last Automated Date,Automated Count',
        'alpha,2024-01-01T00:00:00.000Z,2024-06-01T12:00:00.000Z,3',
        '"beta,prod",2023-01-01T00:00:00.000Z,2023-02-01T00:00:00.000Z,1',
      ].join('\n')
    );
  });

  it('should return only the header when there are no hosts', () => {
    expect(hostMetricsToCsv([])).toBe(
      'Hostname,First Automated Date,Last Automated Date,Automated Count'
    );
  });
});

describe('withHostMetricsPagination', () => {
  it('should replace page and page_size while preserving filters', () => {
    const url = withHostMetricsPagination(
      '/api/v2/host_metrics/?not__deleted=true&hostname__icontains=web&page=3&page_size=10&order_by=hostname',
      1,
      200
    );
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('page')).toBe('1');
    expect(params.get('page_size')).toBe('200');
    expect(params.get('not__deleted')).toBe('true');
    expect(params.get('hostname__icontains')).toBe('web');
    expect(params.get('order_by')).toBe('hostname');
  });

  it('should add pagination when the URL has no query string', () => {
    expect(withHostMetricsPagination('/api/v2/host_metrics/', 2, 50)).toBe(
      '/api/v2/host_metrics/?page=2&page_size=50'
    );
  });
});
