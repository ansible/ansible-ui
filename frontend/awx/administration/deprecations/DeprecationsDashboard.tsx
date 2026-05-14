import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import {
  Alert,
  Bullseye,
  Card,
  CardBody,
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
} from '@patternfly/react-core';
import { Chart, ChartAxis, ChartBar, ChartTooltip } from '@patternfly/react-charts/victory';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@patternfly/react-icons';
import { SeverityLabel } from './DeprecationSeverityLabel';
import { useDeprecationData, TimeRange, DeprecationStat } from './hooks/useDeprecationData';
import {
  useGetPageUrl,
  ITableColumn,
  IToolbarFilter,
  PageTable,
  TextCell,
  ToolbarFilterType,
  useInMemoryView,
} from '@ansible/ansible-ui-framework';
import { EmptyStateNoData } from '@ansible/ansible-ui-framework/components/EmptyStateNoData';
import { PageChartContainer } from '@ansible/ansible-ui-framework/PageDashboard/PageChartContainer';
import { PageChartLegend } from '@ansible/ansible-ui-framework/PageDashboard/PageChartLegend';
import { PageSingleSelect } from '@ansible/ansible-ui-framework/PageInputs/PageSingleSelect';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { AwxRoute } from '../../main/AwxRoutes';

// Module-level constants — do not use t() here
// Hardcoded PF severity colors — CSS variables don't resolve inside SVG fill attributes
const SEVERITY_COLORS: Record<string, string> = {
  hot: '#C9190B',
  warm: '#EC7A08',
  moderate: '#F0AB00',
  cool: '#707070',
};

// Critical = 0 (highest), Minor = 3 (lowest) — used for sort order
const SEVERITY_RANK: Record<string, number> = {
  hot: 0,
  warm: 1,
  moderate: 2,
  cool: 3,
};

type DeprecationRow = DeprecationStat & { severityRank: number };

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
  const { data, isLoading } = useDeprecationData(timeRange);
  const getPageUrl = useGetPageUrl();

  const SEVERITY_LABELS = useMemo<Record<string, string>>(
    () => ({
      hot: t('Critical'),
      warm: t('Important'),
      moderate: t('Moderate'),
      cool: t('Minor'),
    }),
    [t]
  );

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
    ],
    [t]
  );

  const deprecationRows = useMemo<DeprecationRow[]>(
    () =>
      (data?.deprecations ?? []).map((d) => ({
        ...d,
        severityRank: SEVERITY_RANK[d.severity] ?? 99,
      })),
    [data]
  );

  const columns = useMemo<ITableColumn<DeprecationRow>[]>(
    () => [
      {
        header: t('Pattern'),
        cell: (dep) => (
          <>
            <TextCell
              text={dep.type}
              to={getPageUrl(AwxRoute.DeprecationDetails, {
                params: { deprecationType: encodeURIComponent(dep.type) },
              })}
            />
            <Content
              component="small"
              style={{
                color: 'var(--pf-t--global--text--color--subtle)',
                marginTop: 'var(--pf-t--global--spacer--xs)',
                display: 'block',
              }}
            >
              {dep.description}
            </Content>
          </>
        ),
        sort: 'type',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Total occurrences'),
        cell: (dep) => <TextCell text={String(dep.count)} />,
        sort: 'count',
      },
      {
        header: t('Severity'),
        cell: (dep) => <SeverityLabel severity={dep.severity} />,
        sort: 'severityRank',
      },
    ],
    [t, getPageUrl]
  );

  const view = useInMemoryView<DeprecationRow>({
    items: deprecationRows,
    tableColumns: columns,
    toolbarFilters,
    keyFn: (dep) => dep.type,
    disableQueryString: true,
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
    <PageSection>
      {/* Time Range Selector */}
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
            <CardTitle>{t('Total Warnings')}</CardTitle>
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
            <CardTitle>{t('Affected Jobs')}</CardTitle>
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
            <CardTitle>{t('Unique Issues')}</CardTitle>
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

      {/* Deprecation Activity Graph
          PROTOTYPE NOTE: Production should use PF Victory chart theme for severity colors
          and CursorVoronoiContainer for accessible tooltips. */}
      <Card style={{ marginTop: 'var(--pf-t--global--spacer--xl)' }}>
        <CardTitle>{t('Deprecation Activity Graph')}</CardTitle>
        <CardBody>
          {!data?.deprecations.length ? (
            <EmptyStateNoData
              title={t('No deprecation data')}
              description={t('No deprecation warnings were found in the selected time period.')}
            />
          ) : (
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
              <FlexItem>
                <PageChartContainer height={300}>
                  {(size) => {
                    if (!size.width || !size.height) return null;
                    const deps = data?.deprecations ?? [];
                    const maxY = Math.max(...deps.map((d) => d.count), 60);
                    const pad = { top: 20, bottom: 60, left: 80, right: 80 };

                    return (
                      <div style={{ position: 'relative', width: size.width, height: size.height }}>
                        <Chart
                          height={size.height}
                          width={size.width}
                          padding={pad}
                          maxDomain={{ y: maxY }}
                        >
                          <ChartAxis fixLabelOverlap />
                          <ChartAxis
                            dependentAxis
                            showGrid
                            tickFormat={(v: number) => (Number.isInteger(v) ? String(v) : '')}
                          />
                          <ChartBar
                            data={deps.map((dep) => ({
                              x: dep.type,
                              y: dep.count,
                              fill: SEVERITY_COLORS[dep.severity],
                              label: `${dep.type}\n${dep.count} ${t('occurrences')}\n${t('Severity')}: ${SEVERITY_LABELS[dep.severity]}`,
                            }))}
                            style={{
                              data: {
                                fill: (args: { datum?: { fill?: string } }) =>
                                  args.datum?.fill ?? '#06c',
                              },
                            }}
                            labelComponent={
                              <ChartTooltip
                                constrainToVisibleArea
                                style={[
                                  { fontWeight: 'bold', textAnchor: 'start', fontSize: 13 },
                                  { fontWeight: 'normal', textAnchor: 'start', fontSize: 12 },
                                  { fontWeight: 'normal', textAnchor: 'start', fontSize: 12 },
                                ]}
                                flyoutPadding={{ top: 8, bottom: 8, left: 12, right: 12 }}
                              />
                            }
                          />
                        </Chart>
                      </div>
                    );
                  }}
                </PageChartContainer>
              </FlexItem>
              <FlexItem>
                <Flex justifyContent={{ default: 'justifyContentCenter' }}>
                  <FlexItem>
                    <Content
                      component="small"
                      style={{ color: 'var(--pf-t--global--text--color--subtle)' }}
                    >
                      {t('Occurrences by severity')}
                    </Content>
                  </FlexItem>
                </Flex>
                <PageChartLegend
                  id="deprecation-severity-legend"
                  horizontal
                  showLegendCount
                  allowZero
                  legend={(['hot', 'warm', 'moderate', 'cool'] as const).map((sev) => ({
                    label: SEVERITY_LABELS[sev],
                    color: SEVERITY_COLORS[sev],
                    count: (data?.deprecations ?? [])
                      .filter((d) => d.severity === sev)
                      .reduce((s, d) => s + d.count, 0),
                  }))}
                />
              </FlexItem>
            </Flex>
          )}
        </CardBody>
      </Card>

      {/* Deprecation Issues Table */}
      <Card style={{ marginTop: 'var(--pf-t--global--spacer--xl)' }}>
        <CardTitle>{t('Deprecation Issues')}</CardTitle>
        <CardBody style={{ padding: 0 }}>
          <PageTable<DeprecationRow>
            {...view}
            tableColumns={columns}
            toolbarFilters={toolbarFilters}
            keyFn={(dep) => dep.type}
            emptyStateTitle={t('No deprecation issues')}
            emptyStateDescription={t('No deprecation patterns found in the selected time period.')}
            errorStateTitle={t('Error loading deprecation issues')}
          />
        </CardBody>
      </Card>
    </PageSection>
  );
}
