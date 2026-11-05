import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach } from 'vitest';
import { TopTemplates } from './index';
import type { ChartLegendEntry } from '@ansible/react-json-chart-builder';

const template: ChartLegendEntry = {
  id: '1',
  name: 'Deploy',
  enabled: true,
  monetary_gain: 100,
  manual_effort_minutes: 30,
  successful_hosts_total: 2,
  elapsed: 120,
  template_success_rate: 95,
  successful_hosts_savings: 50,
  failed_hosts_total: 0,
  total_count: 3,
  total_org_count: 1,
  total_cluster_count: 1,
  total_inventory_count: 1,
} as unknown as ChartLegendEntry;

describe('TopTemplates table', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders template rows and variable column', () => {
    render(
      <TopTemplates
        data={[template]}
        readOnly
        variableRow={{ key: 'monetary_gain', value: 'Gain' }}
      />
    );
    expect(screen.getByText('Deploy')).toBeInTheDocument();
    expect(screen.getByText('Gain')).toBeInTheDocument();
  });

  it('expands row details when toggle is used', async () => {
    const user = userEvent.setup();
    render(
      <TopTemplates
        data={[template]}
        readOnly={false}
        variableRow={{ key: 'monetary_gain', value: 'Gain' }}
      />
    );

    const expandButton = screen.getByRole('button', { name: /Details/i });
    await user.click(expandButton);
    expect(screen.getByText(/Run time/i)).toBeInTheDocument();
  });
});
