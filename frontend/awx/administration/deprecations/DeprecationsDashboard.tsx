import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  Spinner,
  Label,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Pagination,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td, ThProps } from '@patternfly/react-table';
import {
  FireIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  CheckCircleIcon,
} from '@patternfly/react-icons';
import { useDeprecationData, TimeRange, DeprecationStat } from './hooks/useDeprecationData';
import { useGetPageUrl, PageDashboardChart } from '@ansible/ansible-ui-framework';
import { usePageChartColors } from '@ansible/ansible-ui-framework/PageDashboard/usePageChartColors';
import { PageSingleSelect } from '@ansible/ansible-ui-framework/PageInputs/PageSingleSelect';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { AwxRoute } from '../../main/AwxRoutes';
import { useNavigate } from 'react-router-dom';

type SortDirection = 'asc' | 'desc';

function SeverityLabel({ severity }: { severity: DeprecationStat['severity'] }) {
  const { t } = useTranslation();
  switch (severity) {
    case 'hot':
      return (
        <Label color="red" icon={<FireIcon />}>
          {t('Hot')}
        </Label>
      );
    case 'warm':
      return (
        <Label color="orange" icon={<ExclamationTriangleIcon />}>
          {t('Warn')}
        </Label>
      );
    case 'moderate':
      return (
        <Label color="blue" icon={<InfoCircleIcon />}>
          {t('Moderate')}
        </Label>
      );
    default:
      return (
        <Label color="green" icon={<CheckCircleIcon />}>
          {t('Cool')}
        </Label>
      );
  }
}

export function DeprecationsDashboard() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const { data, isLoading } = useDeprecationData(timeRange);
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const { blueColor } = usePageChartColors();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortIndex, setSortIndex] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  // Bar chart: one group per severity color, one bar per deprecation type
  const chartGroups = useMemo(() => {
    if (!data?.deprecations.length) return [];
    return [
      {
        color: blueColor,
        values: data.deprecations.map((dep) => ({
          label: dep.type,
          value: dep.count,
        })),
      },
    ];
  }, [data, blueColor]);

  // Table filtering + sorting + pagination
  const filteredDeprecations = useMemo(() => {
    const lower = search.toLowerCase();
    return (data?.deprecations ?? []).filter(
      (dep) =>
        !lower ||
        dep.type.toLowerCase().includes(lower) ||
        dep.description.toLowerCase().includes(lower) ||
        dep.severity.toLowerCase().includes(lower)
    );
  }, [data, search]);

  const sortedDeprecations = useMemo(() => {
    if (sortIndex === null) return filteredDeprecations;
    return [...filteredDeprecations].sort((a, b) => {
      let av: string | number, bv: string | number;
      switch (sortIndex) {
        case 0:
          av = a.type;
          bv = b.type;
          break;
        case 1:
          av = a.count;
          bv = b.count;
          break;
        case 2:
          av = a.severity;
          bv = b.severity;
          break;
        default:
          return 0;
      }
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDirection === 'asc' ? av - bv : bv - av;
      }
      return sortDirection === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filteredDeprecations, sortIndex, sortDirection]);

  const paginatedDeprecations = sortedDeprecations.slice((page - 1) * perPage, page * perPage);

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: { index: sortIndex ?? undefined, direction: sortDirection },
    onSort: (_e, index, direction) => {
      setSortIndex(index);
      setSortDirection(direction);
    },
    columnIndex,
  });

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
                {data?.totalWarnings ?? 0}
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
                {data?.affectedJobs ?? 0}
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
                {data?.uniqueIssues ?? 0}
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

      {/* Deprecation Activity Graph (Bar Chart) */}
      <Card style={{ marginTop: 'var(--pf-t--global--spacer--xl)' }}>
        <CardTitle>{t('Deprecation Activity Graph')}</CardTitle>
        <CardBody>
          {!data?.deprecations.length ? (
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
                groups={chartGroups}
                variant="barChart"
                allowZero
                onlyIntegerTicks
                padding={{ right: 16 }}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Deprecation Issues Table */}
      <Card style={{ marginTop: 'var(--pf-t--global--spacer--xl)' }}>
        <CardTitle>{t('Deprecation Issues')}</CardTitle>
        <CardBody style={{ padding: 0 }}>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem>
                <SearchInput
                  placeholder={t('Search by type, description, or severity')}
                  value={search}
                  onChange={(_e, val) => {
                    setSearch(val);
                    setPage(1);
                  }}
                  onClear={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  style={{ minWidth: '300px' }}
                />
              </ToolbarItem>
              <ToolbarItem align={{ default: 'alignEnd' }}>
                <Pagination
                  itemCount={filteredDeprecations.length}
                  page={page}
                  perPage={perPage}
                  onSetPage={(_e, p) => setPage(p)}
                  onPerPageSelect={(_e, pp) => {
                    setPerPage(pp);
                    setPage(1);
                  }}
                  variant="top"
                  isCompact
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>

          {!data?.deprecations.length ? (
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
            <Table variant="compact" aria-label={t('Deprecation issues')}>
              <Thead>
                <Tr>
                  <Th sort={getSortParams(0)}>{t('Deprecation type')}</Th>
                  <Th sort={getSortParams(1)}>{t('Occurrences')}</Th>
                  <Th sort={getSortParams(2)}>{t('Severity')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedDeprecations.map((dep) => (
                  <Tr
                    key={dep.type}
                    isClickable
                    onRowClick={() => {
                      void navigate(
                        getPageUrl(AwxRoute.DeprecationDetails, {
                          params: { deprecationType: encodeURIComponent(dep.type) },
                        })
                      );
                    }}
                  >
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
                        {dep.description}
                      </div>
                    </Td>
                    <Td>{dep.count}</Td>
                    <Td>
                      <SeverityLabel severity={dep.severity} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          <Toolbar>
            <ToolbarContent>
              <ToolbarItem align={{ default: 'alignEnd' }}>
                <Pagination
                  itemCount={filteredDeprecations.length}
                  page={page}
                  perPage={perPage}
                  onSetPage={(_e, p) => setPage(p)}
                  onPerPageSelect={(_e, pp) => {
                    setPerPage(pp);
                    setPage(1);
                  }}
                  variant="bottom"
                  isCompact
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </CardBody>
      </Card>
    </div>
  );
}
