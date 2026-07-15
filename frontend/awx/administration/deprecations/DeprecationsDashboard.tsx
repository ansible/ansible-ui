import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import {
  Alert,
  Bullseye,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Icon,
  PageSection,
  Spinner,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, SyncAltIcon } from '@patternfly/react-icons';
import { useDeprecationData, TimeRange } from './hooks/useDeprecationData';
import {
  useDeprecationDashboardColumns,
  DeprecationRow,
} from './hooks/useDeprecationDashboardColumns';
import {
  IToolbarFilter,
  PageTable,
  ToolbarFilterType,
  useInMemoryView,
} from '@ansible/ansible-ui-framework';
import { PageSingleSelect } from '@ansible/ansible-ui-framework/PageInputs/PageSingleSelect';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';

// Critical = 0 (highest), Minor = 3 (lowest) — used for sort order
const SEVERITY_RANK: Record<string, number> = {
  hot: 0,
  warm: 1,
  moderate: 2,
  cool: 3,
};

function TrendIndicator({ trend }: { trend: number }) {
  const { t } = useTranslation();
  if (trend === 0) {
    return (
      <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem>
          <Icon size="sm">
            <MinusIcon />
          </Icon>
        </FlexItem>
        <FlexItem>
          <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
            {t('No change vs previous period')}
          </Content>
        </FlexItem>
      </Flex>
    );
  }
  const isIncrease = trend > 0;
  return (
    <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem>
        <Icon size="sm" status={isIncrease ? 'danger' : 'success'}>
          {isIncrease ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </Icon>
      </FlexItem>
      <FlexItem>
        <Content
          component="small"
          style={{
            color: isIncrease
              ? 'var(--pf-t--global--color--status--danger--default)'
              : 'var(--pf-t--global--color--status--success--default)',
          }}
        >
          {Math.abs(trend)}% {t('vs previous period')}
        </Content>
      </FlexItem>
    </Flex>
  );
}

export function DeprecationsDashboard() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const { data, isLoading, isRefreshing, refresh } = useDeprecationData(timeRange);

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

  // Build filter options dynamically from data
  const organizationOptions = useMemo(
    () =>
      Array.from(new Set((data?.deprecations ?? []).flatMap((d) => d.organizations))).map(
        (org) => ({ label: org, value: org })
      ),
    [data]
  );

  const jobTemplateOptions = useMemo(
    () =>
      Array.from(new Set((data?.deprecations ?? []).flatMap((d) => d.jobTemplates))).map(
        (tmpl) => ({ label: tmpl, value: tmpl })
      ),
    [data]
  );

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        type: ToolbarFilterType.Search,
        key: 'search',
        label: t('Search'),
        query: 'type',
        placeholder: t('Enter search'),
      },
      {
        type: ToolbarFilterType.SingleSelect,
        key: 'severity',
        label: t('Severity'),
        query: 'severity',
        placeholder: t('Filter by severity'),
        options: [
          { label: t('Critical'), value: 'hot' },
          { label: t('Important'), value: 'warm' },
          { label: t('Moderate'), value: 'moderate' },
          { label: t('Minor'), value: 'cool' },
        ],
      },
      {
        type: ToolbarFilterType.MultiSelect,
        key: 'organization',
        label: t('Organization'),
        query: 'organizations',
        placeholder: t('Filter by organization'),
        options: organizationOptions,
      },
      {
        type: ToolbarFilterType.MultiSelect,
        key: 'jobTemplate',
        label: t('Job Template'),
        query: 'jobTemplates',
        placeholder: t('Filter by job template'),
        options: jobTemplateOptions,
      },
    ],
    [t, organizationOptions, jobTemplateOptions]
  );

  const deprecationRows = useMemo<DeprecationRow[]>(
    () =>
      (data?.deprecations ?? []).map((d) => ({
        type: d.type,
        description: d.description,
        count: d.count,
        severity: d.severity,
        jobIds: d.jobIds,
        jobOccurrences: d.jobOccurrences,
        organizations: d.organizations,
        jobTemplates: d.jobTemplates,
        severityRank: SEVERITY_RANK[d.severity] ?? 99,
      })),
    [data]
  );

  const columns = useDeprecationDashboardColumns(timeRange);

  const view = useInMemoryView<DeprecationRow>({
    items: deprecationRows,
    tableColumns: columns,
    toolbarFilters,
    keyFn: (dep) => dep.type,
    disableQueryString: true,
    defaultSort: 'severityRank',
    defaultSortDirection: 'asc',
  });

  if (isLoading) {
    return (
      <PageSection hasBodyWrapper={false} isFilled>
        <Bullseye>
          <Spinner />
        </Bullseye>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection>
        {/* Time Range Selector + Refresh */}
        <Flex
          spaceItems={{ default: 'spaceItemsMd' }}
          alignItems={{ default: 'alignItemsCenter' }}
          style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}
        >
          <FlexItem>
            <Content
              component="p"
              style={{ fontWeight: 'var(--pf-t--global--font--weight--semi-bold)' }}
            >
              {t('Time period:')}
            </Content>
          </FlexItem>
          <FlexItem style={{ width: '200px' }}>
            <PageSingleSelect<TimeRange>
              value={timeRange}
              onSelect={(value) => value && setTimeRange(value)}
              options={timeRangeOptions}
              placeholder={t('Select time range')}
              isRequired
            />
          </FlexItem>
          <FlexItem>
            <Tooltip content={t('Refresh data')}>
              <Button
                variant="plain"
                aria-label={t('Refresh data')}
                onClick={refresh}
                isDisabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Spinner size="sm" aria-label={t('Refreshing')} />
                ) : (
                  <SyncAltIcon />
                )}
              </Button>
            </Tooltip>
          </FlexItem>
        </Flex>

        {/* Partial data warning — shown when one or more per-job event fetches failed */}
        {data?.hasPartialData && (
          <Alert
            variant="warning"
            isInline
            title={t('Some data could not be loaded')}
            style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}
          >
            {t(
              'Results may be incomplete. Some job event data could not be retrieved, possibly due to permissions or network errors.'
            )}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid hasGutter>
          <GridItem span={4}>
            <Card>
              <CardHeader>
                <CardTitle>{t('Total Warnings')}</CardTitle>
              </CardHeader>
              <CardBody>
                <Title
                  headingLevel="h2"
                  size="4xl"
                  style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
                >
                  {data?.totalWarnings ?? 0}
                </Title>
                {data?.trends?.totalWarnings !== undefined && (
                  <TrendIndicator trend={data.trends.totalWarnings} />
                )}
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={4}>
            <Card>
              <CardHeader>
                <CardTitle>{t('Affected Jobs')}</CardTitle>
              </CardHeader>
              <CardBody>
                <Title
                  headingLevel="h2"
                  size="4xl"
                  style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
                >
                  {data?.affectedJobs ?? 0}
                </Title>
                {data?.trends?.affectedJobs !== undefined && (
                  <TrendIndicator trend={data.trends.affectedJobs} />
                )}
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={4}>
            <Card>
              <CardHeader>
                <CardTitle>{t('Unique Issues')}</CardTitle>
              </CardHeader>
              <CardBody>
                <Title
                  headingLevel="h2"
                  size="4xl"
                  style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
                >
                  {data?.uniqueIssues ?? 0}
                </Title>
                {data?.trends?.uniqueIssues !== undefined && (
                  <TrendIndicator trend={data.trends.uniqueIssues} />
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Deprecation Issues heading */}
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
          style={{ marginTop: 'var(--pf-t--global--spacer--xl)', marginBottom: 0 }}
        >
          <FlexItem>
            <Title headingLevel="h2" size="lg">
              {t('Deprecation Issues')}
            </Title>
          </FlexItem>
          <FlexItem>
            <Content
              component="small"
              style={{ color: 'var(--pf-t--global--text--color--subtle)' }}
            >
              {t('Showing deprecations from last 50 jobs')}
            </Content>
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection
        isFilled
        hasBodyWrapper={false}
        style={{ paddingInline: 0, paddingBlockStart: 0 }}
      >
        <PageTable<DeprecationRow>
          {...view}
          tableColumns={columns}
          toolbarFilters={toolbarFilters}
          keyFn={(dep) => dep.type}
          emptyStateTitle={t('No deprecation issues')}
          emptyStateDescription={t('No deprecation patterns found in the selected time period.')}
          errorStateTitle={t('Error loading deprecation issues')}
        />
      </PageSection>
    </>
  );
}
