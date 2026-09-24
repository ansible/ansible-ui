import { HostMetric } from '../../../interfaces/HostMetric';

/** Escape a value for inclusion in a CSV cell (RFC 4180). */
export function escapeCsvValue(value: string | number | null | undefined): string {
  const str = value == null ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Build a CSV document for host metrics export.
 * Columns match AAPRFE-2696: Hostname, First/Last Automated Date, Automated Count.
 */
export function hostMetricsToCsv(hosts: HostMetric[]): string {
  const header = [
    'Hostname',
    'First Automated Date',
    'Last Automated Date',
    'Automated Count',
  ].join(',');
  const rows = hosts.map((host) =>
    [
      escapeCsvValue(host.hostname),
      escapeCsvValue(host.first_automation),
      escapeCsvValue(host.last_automation),
      escapeCsvValue(host.automated_counter),
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

/** Replace page / page_size on a host_metrics list URL while preserving filters. */
export function withHostMetricsPagination(listUrl: string, page: number, pageSize: number): string {
  const questionIndex = listUrl.indexOf('?');
  const path = questionIndex === -1 ? listUrl : listUrl.slice(0, questionIndex);
  const query = questionIndex === -1 ? '' : listUrl.slice(questionIndex + 1);
  const params = new URLSearchParams(query);
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  return `${path}?${params.toString()}`;
}
