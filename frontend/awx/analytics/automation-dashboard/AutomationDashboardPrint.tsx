import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import useSWR from 'swr';
import { metricsAPI } from '../../common/api/metrics-utils';
import { swrOptions, useFetcher } from '../../../common/crud/Data';
import { IDashboardDetails, IJobTemplate } from './types';
import { DashboardValueCard } from './components/DashboardValueCard';
import { DashboardChartCard } from './components/DashboardChartCard';
import { DashboardTableCard } from './components/DashboardTableCard';
import { PageDashboard } from '@ansible/ansible-ui-framework';

// Injected into <head> on mount: hides the app shell chrome on the print preview page
// (both on-screen, so the report fills the full viewport, and during printing).
const SHELL_HIDE_STYLES = `
  .pf-v6-c-masthead,
  .pf-v6-c-page__sidebar,
  .pf-v6-c-nav { display: none !important; }
  .pf-v6-c-page__main { margin-left: 0 !important; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pf-v6-c-card { break-inside: avoid; }
  }
`;

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

export function AutomationDashboardPrint() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher();
  const hasPrinted = useRef(false);

  // Inject shell-hiding styles and clean up on unmount.
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = SHELL_HIDE_STYLES;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  const queryString = searchParams.toString();

  const detailsUrl = metricsAPI`/dashboard_reports/report/details/?${queryString}`;
  const { data: details, isLoading: detailsLoading } = useSWR<IDashboardDetails>(
    detailsUrl,
    fetcher,
    swrOptions
  );

  // Fetch all templates in a single request for the print view — no pagination needed.
  const tableParams = new URLSearchParams([...searchParams.entries()]);
  tableParams.set('page_size', '200');
  const tableUrl = metricsAPI`/dashboard_reports/report/?${tableParams.toString()}`;
  const { data: tableData, isLoading: tableLoading } = useSWR<PaginatedResponse<IJobTemplate>>(
    tableUrl,
    fetcher,
    swrOptions
  );

  const isReady = !detailsLoading && !tableLoading && !!details;

  // Auto-trigger the browser print dialog once all data has loaded.
  useEffect(() => {
    if (isReady && !hasPrinted.current) {
      hasPrinted.current = true;
      window.addEventListener('afterprint', () => window.close(), { once: true });
      window.print();
    }
  }, [isReady]);

  const noDataString = t('No data available');
  const templates = tableData?.results ?? [];
  const period = searchParams.get('period') ?? '';

  if (!isReady) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{t('Preparing report...')}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Report header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
          {t('Automation Dashboard Report')}
        </h1>
        {period && (
          <p style={{ margin: '0.25rem 0 0', color: '#6a6e73' }}>
            {t('Period: {{period}}', { period: period.replace(/_/g, ' ') })}
          </p>
        )}
      </div>

      {/* KPI summary cards */}
      <PageDashboard>
        <DashboardValueCard
          id="print-successful-jobs"
          title={t('Successful jobs')}
          value={details.total_number_of_successful_jobs ?? noDataString}
          error={undefined}
          errorStateTitle={t('Error loading successful jobs')}
        />
        <DashboardValueCard
          id="print-failed-jobs"
          title={t('Failed jobs')}
          value={details.total_number_of_failed_jobs ?? noDataString}
          error={undefined}
          errorStateTitle={t('Error loading failed jobs')}
        />
        <DashboardValueCard
          id="print-unique-hosts"
          title={t('Hosts automated')}
          value={details.total_number_of_unique_hosts ?? noDataString}
          error={undefined}
          errorStateTitle={t('Error loading hosts')}
        />
        <DashboardValueCard
          id="print-automation-hours"
          title={t('Hours of automation')}
          value={details.total_hours_of_automation ?? noDataString}
          valueSuffix="h"
          error={undefined}
          errorStateTitle={t('Error loading automation hours')}
        />

        {/* Top tables */}
        <DashboardTableCard
          id="print-top-projects"
          title={t('Top 5 projects')}
          firstColumnHeader={t('Project name')}
          emptyStateTitle={t('No projects')}
          errorStateTitle={t('Error loading projects')}
          items={details.top_projects}
          error={undefined}
          loading={false}
        />
        <DashboardTableCard
          id="print-top-users"
          title={t('Top 5 users')}
          firstColumnHeader={t('User name')}
          emptyStateTitle={t('No users')}
          errorStateTitle={t('Error loading users')}
          items={details.top_users}
          error={undefined}
          loading={false}
        />

        {/* Charts */}
        <DashboardChartCard
          id="print-host-chart"
          title={t('Number of hosts jobs are running on')}
          summaryValue={details.total_number_of_host_job_runs ?? 0}
          data={details.host_chart ?? { kind: 'day', items: [] }}
          variant="lineChart"
          error={undefined}
          errorStateTitle={t('Error loading host chart')}
        />
        <DashboardChartCard
          id="print-job-chart"
          title={t('Number of times jobs were run')}
          summaryValue={details.total_number_of_job_runs ?? 0}
          data={details.job_chart ?? { kind: 'day', items: [] }}
          variant="barChart"
          error={undefined}
          errorStateTitle={t('Error loading job chart')}
        />
      </PageDashboard>

      {/* Cost summary */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '1.5rem 0 0.75rem' }}>
        {t('Cost analysis')}
      </h2>
      <PageDashboard>
        <DashboardValueCard
          id="print-manual-cost"
          title={t('Cost of manual automation')}
          value={details.cost_of_manual_automation ?? noDataString}
          error={undefined}
          errorStateTitle={t('Error loading manual cost')}
        />
        <DashboardValueCard
          id="print-automated-cost"
          title={t('Cost of automated execution')}
          value={details.cost_of_automated_execution ?? noDataString}
          error={undefined}
          errorStateTitle={t('Error loading automated cost')}
        />
        <DashboardValueCard
          id="print-total-savings"
          title={t('Total savings / cost avoided')}
          value={details.total_saving ?? noDataString}
          error={undefined}
          errorStateTitle={t('Error loading savings')}
        />
        <DashboardValueCard
          id="print-hours-saved"
          title={t('Total hours saved / avoided')}
          value={details.total_time_saving ?? noDataString}
          valueSuffix="h"
          error={undefined}
          errorStateTitle={t('Error loading hours saved')}
        />
      </PageDashboard>

      {/* ROI table — all rows, no pagination */}
      {templates.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '1.5rem 0 0.75rem' }}>
            {t('Job template ROI')}
          </h2>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                {[
                  t('Template name'),
                  t('Executions'),
                  t('Running time'),
                  t('Manual cost'),
                  t('Automated cost'),
                  t('Savings'),
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: '0.5rem 0.75rem',
                      textAlign: 'left',
                      borderBottom: '2px solid #d2d2d2',
                      fontWeight: 600,
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {templates.map((template, index) => (
                <tr
                  key={template.id}
                  style={{ background: index % 2 === 0 ? '#ffffff' : '#fafafa' }}
                >
                  <td style={{ padding: '0.4rem 0.75rem', borderBottom: '1px solid #e8e8e8' }}>
                    {template.template_name}
                  </td>
                  <td style={{ padding: '0.4rem 0.75rem', borderBottom: '1px solid #e8e8e8' }}>
                    {template.runs}
                  </td>
                  <td style={{ padding: '0.4rem 0.75rem', borderBottom: '1px solid #e8e8e8' }}>
                    {template.elapsed}
                  </td>
                  <td style={{ padding: '0.4rem 0.75rem', borderBottom: '1px solid #e8e8e8' }}>
                    {template.manual_costs}
                  </td>
                  <td style={{ padding: '0.4rem 0.75rem', borderBottom: '1px solid #e8e8e8' }}>
                    {template.automated_costs}
                  </td>
                  <td style={{ padding: '0.4rem 0.75rem', borderBottom: '1px solid #e8e8e8' }}>
                    {template.savings}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
