import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  Spinner,
  Progress,
  ProgressVariant,
  Button,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { ExclamationTriangleIcon, InfoCircleIcon } from '@patternfly/react-icons';
import {
  useDeprecationData,
  getDeprecationDescription,
  TimeRange,
} from './hooks/useDeprecationData';
import { useGetPageUrl, PageDashboardChart } from '@ansible/ansible-ui-framework';
import { usePageChartColors } from '@ansible/ansible-ui-framework/PageDashboard/usePageChartColors';
import { PageSingleSelect } from '@ansible/ansible-ui-framework/PageInputs/PageSingleSelect';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { AwxRoute } from '../../main/AwxRoutes';
import { useNavigate } from 'react-router-dom';

function getSeverityVariant(severity: string): ProgressVariant {
  switch (severity) {
    case 'hot':
      return ProgressVariant.danger;
    case 'warm':
      return ProgressVariant.warning;
    case 'moderate':
    default:
      return ProgressVariant.success;
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'hot':
    case 'warm':
      return <ExclamationTriangleIcon />;
    default:
      return <InfoCircleIcon />;
  }
}

function getSeverityLabel(severity: string, t: (key: string) => string): string {
  switch (severity) {
    case 'hot':
      return t('Hot');
    case 'warm':
      return t('Warn');
    case 'moderate':
      return t('Moderate');
    default:
      return t('Cool');
  }
}

export function DeprecationsDashboard() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const { data, isLoading } = useDeprecationData(timeRange);
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const { blueColor } = usePageChartColors();

  const timeRangeOptions: PageSelectOption<TimeRange>[] = useMemo(
    () => [
      { value: '7d', label: t('Last 7 days') },
      { value: '30d', label: t('Last 30 days') },
      { value: '6m', label: t('Last 6 months') },
      { value: '1y', label: t('Last year') },
      { value: 'all', label: t('All time') },
    ],
    [t]
  );

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--pf-t--global--spacer--xl)', textAlign: 'center' }}>
        <Spinner size="xl" />
        <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
          {t('Loading deprecation data...')}
        </div>
      </div>
    );
  }

  const maxCount = data?.deprecations[0]?.count || 1;

  // Prepare chart data for trend graph
  const chartData =
    data?.eventsByDate.map((item) => ({
      label: item.date,
      value: item.events.length,
    })) || [];

  return (
    <div style={{ padding: 'var(--pf-t--global--spacer--xl)' }}>
      {/* Time Range Selector */}
      <div
        style={{
          marginBottom: 'var(--pf-t--global--spacer--lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--pf-t--global--spacer--md)',
        }}
      >
        <div style={{ fontWeight: 'var(--pf-t--global--font--weight--semi-bold)' }}>
          {t('Time period:')}
        </div>
        <div style={{ width: '200px' }}>
          <PageSingleSelect<TimeRange>
            value={timeRange}
            onSelect={(value) => value && setTimeRange(value)}
            options={timeRangeOptions}
            placeholder={t('Select time range')}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <Grid hasGutter>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Total Warnings')}</CardTitle>
            <CardBody>
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--4xl)',
                  fontWeight: 'var(--pf-t--global--font--weight--light)',
                  marginBottom: 'var(--pf-t--global--spacer--sm)',
                }}
              >
                {data?.totalWarnings || 0}
              </div>
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--sm)',
                  color: 'var(--pf-t--global--text--color--subtle)',
                }}
              >
                {t('From recent job executions')}
              </div>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Affected Jobs')}</CardTitle>
            <CardBody>
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--4xl)',
                  fontWeight: 'var(--pf-t--global--font--weight--light)',
                  marginBottom: 'var(--pf-t--global--spacer--sm)',
                }}
              >
                {data?.affectedJobs || 0}
              </div>
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--sm)',
                  color: 'var(--pf-t--global--text--color--subtle)',
                }}
              >
                {t('Jobs with deprecation warnings')}
              </div>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Unique Issues')}</CardTitle>
            <CardBody>
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--4xl)',
                  fontWeight: 'var(--pf-t--global--font--weight--light)',
                  marginBottom: 'var(--pf-t--global--spacer--sm)',
                }}
              >
                {data?.uniqueIssues || 0}
              </div>
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--sm)',
                  color: 'var(--pf-t--global--text--color--subtle)',
                }}
              >
                {t('Different deprecation types')}
              </div>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Trend Graph */}
      <Card style={{ marginTop: 'var(--pf-t--global--spacer--xl)' }}>
        <CardTitle>{t('Deprecation Trends Over Time')}</CardTitle>
        <CardBody>
          {!data?.eventsByDate || data.eventsByDate.length === 0 ? (
            <div
              style={{
                padding: 'var(--pf-t--global--spacer--xl)',
                textAlign: 'center',
                color: 'var(--pf-t--global--text--color--subtle)',
              }}
            >
              {t('No deprecation data in selected time period')}
            </div>
          ) : (
            <div style={{ height: '300px' }}>
              <PageDashboardChart
                groups={[
                  {
                    label: t('Total Deprecations'),
                    color: blueColor,
                    values: chartData,
                  },
                ]}
                variant="stackedAreaChart"
                allowZero
                onlyIntegerTicks
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Heat Map Card */}
      <Card style={{ marginTop: 'var(--pf-t--global--spacer--xl)' }}>
        <CardTitle>{t('Deprecation Activity Heat Map')}</CardTitle>
        <CardBody>
          {!data?.deprecations || data.deprecations.length === 0 ? (
            <div
              style={{
                padding: 'var(--pf-t--global--spacer--xl)',
                textAlign: 'center',
                color: 'var(--pf-t--global--text--color--subtle)',
              }}
            >
              {t('No deprecation warnings found in recent jobs')}
            </div>
          ) : (
            <div style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
              {data.deprecations.map((dep) => (
                <div
                  key={dep.type}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--pf-t--global--spacer--md)',
                    marginBottom: 'var(--pf-t--global--spacer--md)',
                    padding: 'var(--pf-t--global--spacer--md)',
                    cursor: 'pointer',
                    borderRadius: 'var(--pf-t--global--border--radius--medium)',
                  }}
                  onClick={() => {
                    const jobsUrl = getPageUrl(AwxRoute.Jobs, {
                      query: { id__in: dep.jobIds.join(',') },
                    });
                    void navigate(jobsUrl);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const jobsUrl = getPageUrl(AwxRoute.Jobs, {
                        query: { id__in: dep.jobIds.join(',') },
                      });
                      void navigate(jobsUrl);
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      'var(--pf-t--global--background--color--action--hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div
                    style={{
                      flex: '0 0 220px',
                      fontWeight: 'var(--pf-t--global--font--weight--semi-bold)',
                      fontSize: 'var(--pf-t--global--font--size--sm)',
                    }}
                  >
                    {dep.type}
                  </div>
                  <div style={{ flex: '1' }}>
                    <Progress
                      value={(dep.count / maxCount) * 100}
                      title={`${dep.count} ${t('occurrences')}`}
                      variant={getSeverityVariant(dep.severity)}
                    />
                  </div>
                  <div
                    style={{
                      flex: '0 0 110px',
                      textAlign: 'right',
                      fontSize: 'var(--pf-t--global--font--size--sm)',
                    }}
                  >
                    {getSeverityIcon(dep.severity)}{' '}
                    <span style={{ fontWeight: 'var(--pf-t--global--font--weight--semi-bold)' }}>
                      {getSeverityLabel(dep.severity, t)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Table Card */}
      <Card style={{ marginTop: 'var(--pf-t--global--spacer--xl)' }}>
        <CardTitle>{t('Deprecation Issues')}</CardTitle>
        <CardBody>
          <div
            style={{
              fontSize: 'var(--pf-t--global--font--size--sm)',
              color: 'var(--pf-t--global--text--color--subtle)',
              marginBottom: 'var(--pf-t--global--spacer--md)',
            }}
          >
            {t('Click on occurrence count to view affected jobs and their templates')}
          </div>

          {!data?.deprecations || data.deprecations.length === 0 ? (
            <div
              style={{
                padding: 'var(--pf-t--global--spacer--xl)',
                textAlign: 'center',
                color: 'var(--pf-t--global--text--color--subtle)',
              }}
            >
              {t('No deprecation warnings found')}
            </div>
          ) : (
            <Table variant="compact">
              <Thead>
                <Tr>
                  <Th>{t('Deprecation Type')}</Th>
                  <Th>{t('Occurrences')}</Th>
                  <Th>{t('Severity')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.deprecations.map((dep) => (
                  <Tr key={dep.type}>
                    <Td>
                      <div style={{ fontWeight: 'var(--pf-t--global--font--weight--semi-bold)' }}>
                        {dep.type}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--pf-t--global--font--size--sm)',
                          color: 'var(--pf-t--global--text--color--subtle)',
                          marginTop: 'var(--pf-t--global--spacer--xs)',
                        }}
                      >
                        {getDeprecationDescription(dep.type)}
                      </div>
                    </Td>
                    <Td>
                      <Button
                        variant="link"
                        isInline
                        onClick={() => {
                          const jobsUrl = getPageUrl(AwxRoute.Jobs, {
                            query: { id__in: dep.jobIds.join(',') },
                          });
                          void navigate(jobsUrl);
                        }}
                      >
                        {dep.count}
                      </Button>
                    </Td>
                    <Td>
                      {getSeverityIcon(dep.severity)}{' '}
                      <span style={{ fontWeight: 'var(--pf-t--global--font--weight--semi-bold)' }}>
                        {getSeverityLabel(dep.severity, t)}
                      </span>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
