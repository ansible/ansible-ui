import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildChartLegendEntry } from './chartLegendEntry.fixture';
import { Row } from './Row';

const template = buildChartLegendEntry({
  id: 7,
  name: 'Configure',
  enabled: 1,
  monetary_gain: 80,
  manual_effort_minutes: 45,
  successful_hosts_total: 4,
  elapsed: 200,
  template_success_rate: 88,
  successful_hosts_savings: 20,
  failed_hosts_total: 1,
  total_count: 2,
  total_org_count: 1,
  total_cluster_count: 1,
  total_inventory_count: 1,
  host_count: 3,
});

describe('TemplatesTable Row', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders formatted variable values and savings', () => {
    render(
      <table>
        <tbody>
          <Row template={template} readOnly variableRow={{ key: 'host_count', value: 'Hosts' }} />
        </tbody>
      </table>
    );
    expect(screen.getByText('Configure')).toBeInTheDocument();
    expect(screen.getByText('3.00')).toBeInTheDocument();
    expect(screen.getByText('$80.00')).toBeInTheDocument();
  });

  it('persists expanded state in local storage', async () => {
    const user = userEvent.setup();
    render(
      <table>
        <tbody>
          <Row
            template={template}
            readOnly={false}
            variableRow={{ key: 'host_count', value: 'Hosts' }}
          />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole('button', { name: /Details/i }));
    expect(window.localStorage.getItem('7')).toBe('true');
  });
});
