/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageAlertToasterProvider } from '@ansible/ansible-ui-framework';
import { awxAPI } from '../../common/api/awx-utils';
import { AutomationCalculator, AutomationCalculatorInternal } from './AutomationCalculator';

vi.mock('../components/Chart', () => ({
  Chart: () => <div data-testid="roi-chart" />,
}));

const optionsResponse = {
  cluster_id: [{ key: '1', value: 'Default' }],
  org_id: [{ key: '2', value: 'Org' }],
  template_id: [{ key: '3', value: 'Template' }],
  inventory_id: [{ key: '4', value: 'Inventory' }],
  quick_date_range: [{ key: 'roi_last_year', value: 'Last year' }],
  sort_options: [{ key: 'host_count', value: 'Host count' }],
};

const reportResponse = {
  meta: {
    count: 1,
    legend: [
      {
        id: '1',
        name: 'Deploy app',
        enabled: true,
        monetary_gain: 250,
        manual_effort_minutes: 30,
        successful_hosts_total: 2,
        elapsed: 100,
        host_count: 5,
        template_success_rate: 90,
        successful_hosts_savings: 40,
        failed_hosts_total: 0,
        total_count: 3,
        total_org_count: 1,
        total_cluster_count: 1,
        total_inventory_count: 1,
      },
    ],
  },
  monetary_gain_current_page: 250,
  monetary_gain_other_pages: 100,
  cost: { hourly_manual_labor_cost: 50, hourly_automation_cost: 5 },
};

const server = setupServer(
  http.post(awxAPI`/analytics/roi_templates/*`, () => HttpResponse.json(reportResponse)),
  http.post(awxAPI`/analytics/roi_templates_options/`, () => HttpResponse.json(optionsResponse))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('swr', () => ({
  default: vi.fn((key: string) => {
    if (String(key).includes('roi_templates_options')) {
      return { data: optionsResponse, isLoading: false, error: undefined };
    }
    return { data: undefined, isLoading: false, error: undefined };
  }),
}));

function renderCalculator() {
  return render(
    <PageAlertToasterProvider>
      <MemoryRouter initialEntries={['/?sort=host_count']}>
        <AutomationCalculator schema={[{ type: 'line' }]} />
      </MemoryRouter>
    </PageAlertToasterProvider>
  );
}

function renderInternal() {
  return render(
    <PageAlertToasterProvider>
      <MemoryRouter initialEntries={['/?sort=host_count&page=1&per_page=10']}>
        <AutomationCalculatorInternal
          schema={[{ type: 'line' }]}
          filterState={{ quick_date_range: ['roi_last_year'], org_id: ['2'] }}
          setFilterState={vi.fn()}
          sortOption={{ label: 'Host count', value: 'host_count' }}
          sortDirection="desc"
          setSortDirection={vi.fn()}
        />
      </MemoryRouter>
    </PageAlertToasterProvider>
  );
}

describe('AutomationCalculator', () => {
  it('renders toolbar after options load', async () => {
    renderCalculator();
    await waitFor(() => expect(screen.getByText('Cluster')).toBeInTheDocument());
  });

  it('loads ROI data and renders chart and savings', async () => {
    renderInternal();
    await waitFor(() => expect(screen.getByTestId('roi-chart')).toBeInTheDocument());
    expect(screen.getByText('$350.00')).toBeInTheDocument();
    expect(screen.getByText('Deploy app')).toBeInTheDocument();
  });

  it('shows empty state when no templates match filters', async () => {
    server.use(
      http.post(awxAPI`/analytics/roi_templates/*`, () =>
        HttpResponse.json({
          meta: { count: 0, legend: [] },
          monetary_gain_current_page: 0,
          monetary_gain_other_pages: 0,
          cost: { hourly_manual_labor_cost: 0, hourly_automation_cost: 0 },
        })
      )
    );
    renderInternal();
    await waitFor(() => expect(screen.getByText(/No results found/i)).toBeInTheDocument());
  });
});
