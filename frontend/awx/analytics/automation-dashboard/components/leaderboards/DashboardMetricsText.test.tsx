import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { MetricLabel, MetricValue } from './DashboardMetricsText';

describe('DashboardMetricsText', () => {
  test('should render the metric value as text, not a heading', () => {
    render(<MetricValue>1,234</MetricValue>);

    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '1,234' })).not.toBeInTheDocument();
  });

  test('should render the metric label text', () => {
    render(<MetricLabel>active days</MetricLabel>);

    expect(screen.getByText('active days')).toBeInTheDocument();
  });
});
