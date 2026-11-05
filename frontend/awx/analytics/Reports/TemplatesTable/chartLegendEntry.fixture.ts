import type { ChartLegendEntry } from '@ansible/react-json-chart-builder';

const defaultChartLegendEntry: ChartLegendEntry = {
  id: 1,
  name: 'Template',
  enabled: 1,
  monetary_gain: 0,
  manual_effort_minutes: 60,
  successful_hosts_total: 0,
  elapsed: 0,
  template_success_rate: 0,
  successful_hosts_savings: 0,
  failed_hosts_total: 0,
  total_count: 0,
  total_org_count: 0,
  total_cluster_count: 0,
  total_inventory_count: 0,
  host_count: 0,
};

/** Merge overrides onto analytics template defaults (ChartLegendEntry allows only string | number fields). */
export function buildChartLegendEntry(overrides: ChartLegendEntry): ChartLegendEntry {
  return { ...defaultChartLegendEntry, ...overrides };
}
