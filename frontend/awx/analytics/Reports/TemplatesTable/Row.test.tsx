import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildChartLegendEntry } from './chartLegendEntry.fixture';
import { Row } from './Row';

const expandedRowTemplateId = 8723641;

const template = buildChartLegendEntry({
  id: expandedRowTemplateId,
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

  it('renders disabled savings styling and unchecked show switch when template is disabled', () => {
    render(
      <table>
        <tbody>
          <Row
            template={{ ...template, enabled: 0, monetary_gain: 120 }}
            readOnly
            variableRow={{ key: 'host_count', value: 'Hosts' }}
          />
        </tbody>
      </table>
    );
    expect(screen.getByText('$120.00')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Show' })).not.toBeChecked();
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
    await waitFor(() => {
      expect(window.localStorage.getItem(String(expandedRowTemplateId))).toBe('true');
    });
  });
});
