import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
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
  PageSection,
  Spinner,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { useDeprecationData } from './hooks/useDeprecationData';
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

// Critical = 0 (highest), Minor = 3 (lowest) — used for sort order
const SEVERITY_RANK: Record<string, number> = {
  hot: 0,
  warm: 1,
  moderate: 2,
  cool: 3,
};

export function DeprecationsDashboard() {
  const { t } = useTranslation();
  const { data, isLoading, isRefreshing, refresh } = useDeprecationData();

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
        comparison: 'contains',
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

  const columns = useDeprecationDashboardColumns();

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
                <Title headingLevel="h2" size="4xl">
                  {data?.totalWarnings ?? 0}
                </Title>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={4}>
            <Card>
              <CardHeader>
                <CardTitle>{t('Affected Jobs')}</CardTitle>
              </CardHeader>
              <CardBody>
                <Title headingLevel="h2" size="4xl">
                  {data?.affectedJobs ?? 0}
                </Title>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={4}>
            <Card>
              <CardHeader>
                <CardTitle>{t('Unique Issues')}</CardTitle>
              </CardHeader>
              <CardBody>
                <Title headingLevel="h2" size="4xl">
                  {data?.uniqueIssues ?? 0}
                </Title>
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
            <Flex
              spaceItems={{ default: 'spaceItemsMd' }}
              alignItems={{ default: 'alignItemsCenter' }}
            >
              <FlexItem>
                <Content
                  component="small"
                  style={{ color: 'var(--pf-t--global--text--color--subtle)' }}
                >
                  {t('Showing deprecations from last 50 jobs')}
                </Content>
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
          emptyStateDescription={t('No deprecation patterns found in the last 50 jobs.')}
          errorStateTitle={t('Error loading deprecation issues')}
        />
      </PageSection>
    </>
  );
}
