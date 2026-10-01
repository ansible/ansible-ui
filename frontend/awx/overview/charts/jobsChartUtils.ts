export type DashboardJobPeriod = 'month' | 'two_weeks' | 'week' | 'day';

export function formatDashboardJobChartDateLabel(
  epochSeconds: number,
  period?: DashboardJobPeriod
): string {
  const date = new Date(epochSeconds * 1000);
  if (period === 'day') {
    return date.toLocaleTimeString();
  }
  // Controller dashboard graph buckets use UTC day boundaries.
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
}

export type JobChartSeriesPoint = { ts: number; label: string; value: number };

export function mapJobChartTuples(
  tuples: [number, number][] | undefined,
  period?: DashboardJobPeriod
): JobChartSeriesPoint[] {
  return (tuples ?? []).map(([ts, value]) => ({
    ts,
    label: formatDashboardJobChartDateLabel(ts, period),
    value,
  }));
}

/** Align every status series to the same ordered x categories (AAP-95233). */
export function alignJobChartSeriesByDay(
  series: JobChartSeriesPoint[][]
): Array<Array<{ label: string; value: number }>> {
  const tsByLabel = new Map<string, number>();
  for (const points of series) {
    for (const point of points) {
      tsByLabel.set(point.label, point.ts);
    }
  }
  const orderedLabels = [...tsByLabel.entries()]
    .sort(([, tsA], [, tsB]) => tsA - tsB)
    .map(([label]) => label);

  return series.map((points) => {
    const valueByLabel = new Map(points.map((point) => [point.label, point.value]));
    return orderedLabels.map((label) => ({
      label,
      value: valueByLabel.get(label) ?? 0,
    }));
  });
}
