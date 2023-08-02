import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Grid,
  GridItem,
  PageSection,
  Pagination,
  PaginationVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartLegendEntry, ChartSchemaElement } from 'react-json-chart-builder';
import useSWR from 'swr';
import {
  IFilterState,
  IToolbarFilter,
  PageTableToolbar,
  Scrollable,
  ToolbarFilterType,
} from '../../../../framework';
import { PageTableSortOption } from '../../../../framework/PageTable/PageToolbar/PageToolbarSort';
import { EmptyStateFilter } from '../../../../framework/components/EmptyStateFilter';
import { LoadingState } from '../../../../framework/components/LoadingState';
import { useSearchParams } from '../../../../framework/components/useSearchParams';
import { postRequest as requestPost } from '../../../common/crud/Data';
import Chart from '../components/Chart';
import hydrateSchema from '../components/Chart/hydrateSchema';
import { ApiOptionsType } from '../components/Toolbar/types';
import currencyFormatter from '../utilities/currencyFormatter';
import AutomationFormula from './AutomationFormula';
import CalculationCost from './CalculationCost';
import { AnalyticsErrorState } from './ErrorStates';
import TemplatesTable from './TemplatesTable';
import TotalSavings from './TotalSavings';

export interface ReportDataResponse {
  meta: {
    count: number;
    legend: ChartLegendEntry[];
  };
  monetary_gain_current_page: number;
  monetary_gain_other_pages: number;
  cost: {
    hourly_manual_labor_cost: number;
    hourly_automation_cost: number;
  };
}

export interface ParamsType {
  status: string[];
  org_id: string[];
  cluster_id: string[];
  template_id: string[];
  inventory_id: string[];
  quick_date_range: string;
  job_type: string[];
  sort_options: string;
  sort_order: string;
  start_date: string | undefined;
  end_date: string | undefined;
  limit: string;
  offset: string;
  only_root_workflows_and_standalone_jobs: boolean;
  template_weigh_in: string[] | undefined;
  attributes: string[];
  group_by: string;
  group_by_time: boolean;
}

export function AutomationCalculator(props: { schema: ChartSchemaElement[] }) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const { schema } = props;

  const {
    data: options,
    isLoading,
    error,
  } = useSWR<ApiOptionsType, Error>(`/api/v2/analytics/roi_templates_options/`, requestPost);

  const keyFn = useCallback(() => {
    return '';
  }, []);

  const [filterState, setFilterState] = useState<IFilterState>(() => {
    return {};
  });

  const toolbarFilters = useMemo(() => {
    const toolbarFilters: IToolbarFilter[] = [];
    if (options) {
      if (options.cluster_id && options.cluster_id.length > 0) {
        toolbarFilters.push({
          key: 'cluster_id',
          query: 'cluster_id',
          type: ToolbarFilterType.MultiSelect,
          label: t('Cluster'),
          placeholder: t('Filter by Cluster'),
          options: options.cluster_id.map((option) => ({
            label: option.value.toString(),
            value: option.key.toString(),
          })),
        });
      }
      if (options.org_id && options.org_id.length > 0) {
        toolbarFilters.push({
          key: 'org_id',
          query: 'org_id',
          type: ToolbarFilterType.MultiSelect,
          label: t('Organization'),
          placeholder: t('Filter by Organization'),
          options: options.org_id.map((option) => ({
            label: option.value.toString(),
            value: option.key.toString(),
          })),
        });
      }
      if (options.template_id && options.template_id.length > 0) {
        toolbarFilters.push({
          key: 'template_id',
          query: 'template_id',
          type: ToolbarFilterType.MultiSelect,
          label: t('Template'),
          placeholder: t('Filter by Template'),
          options: options.template_id.map((option) => ({
            label: option.value.toString(),
            value: option.key.toString(),
          })),
        });
      }
      if (options.inventory_id && options.inventory_id.length > 0) {
        toolbarFilters.push({
          key: 'inventory_id',
          query: 'inventory_id',
          type: ToolbarFilterType.MultiSelect,
          label: t('Inventory'),
          placeholder: t('Filter by Inventory'),
          options: options.inventory_id.map((option) => ({
            label: option.value.toString(),
            value: option.key.toString(),
          })),
        });
      }
      if (options.quick_date_range && options.quick_date_range.length > 0) {
        toolbarFilters.push({
          key: 'quick_date_range',
          query: 'quick_date_range',
          type: ToolbarFilterType.DateRange,
          label: t('Date'),
          options: options.quick_date_range.map((option) => ({
            label: option.value.toString(),
            value: option.key.toString(),
            isCustom: option.key === 'roi_custom',
          })),
          isRequired: true,
          isPinned: true,
        });
      }
    }
    return toolbarFilters;
  }, [options, t]);

  const [sort, setSort] = useState<string>(() => {
    let sort = searchParams.get('sort');
    if (sort) {
      if (sort?.startsWith('-')) sort = sort.substring(1);
      return sort;
    }
    return 'host_count';
  });
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
    const sort = searchParams.get('sort');
    if (sort) {
      if (sort?.startsWith('-')) return 'asc';
      return 'desc';
    }
    return 'desc';
  });
  const sortOptions = useMemo<PageTableSortOption[]>(() => {
    if (options) {
      return options.sort_options.map((option) => ({
        label: option.value.toString(),
        value: option.key.toString(),
        type: 'number',
        defaultDirection: 'desc',
      }));
    }
    return [];
  }, [options]);
  const sortOption = useMemo(
    () => sortOptions.find((option) => option.value === sort),
    [sort, sortOptions]
  );

  if (isLoading) {
    return <LoadingState />;
  } else if (error) {
    return <AnalyticsErrorState error={error.message} />;
  }

  if (!sortOption) {
    return <LoadingState />;
  }

  return (
    <>
      <PageTableToolbar
        keyFn={keyFn}
        itemCount={0}
        toolbarFilters={toolbarFilters}
        filterState={filterState}
        setFilterState={setFilterState}
        sortOptions={sortOptions}
        sort={sort}
        setSort={setSort}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        disablePagination
      />
      <AutomationCalculatorInternal
        schema={schema}
        filterState={filterState}
        sortOption={sortOption}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
      />
    </>
  );
}

export function AutomationCalculatorInternal(props: {
  schema: ChartSchemaElement[];
  filterState: IFilterState;
  sortOption: SortOption;
  sortDirection: 'asc' | 'desc';
  setSortDirection: Dispatch<SetStateAction<'asc' | 'desc'>>;
}) {
  const { t } = useTranslation();
  const {
    schema,
    filterState,
    sortOption,
    sortDirection: sortOrder,
    setSortDirection: setSortOrder,
  } = props;

  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState<number>(() =>
    searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1
  );
  const [perPage, setPerPage] = useState<number>(() =>
    searchParams.get('per_page') ? parseInt(searchParams.get('per_page') as string) : 10
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (sortOption) {
      if (sortOrder === 'desc') {
        params.set('sort', sortOption.value);
      } else {
        params.set('sort', '-' + sortOption.value);
      }
    }
    params.set('page', page.toString());
    params.set('per_page', perPage.toString());
    if (filterState) {
      if (filterState.org_id) {
        params.set('org_id', filterState.org_id.join(','));
      }
      if (filterState.cluster_id) {
        params.set('cluster_id', filterState.cluster_id.join(','));
      }
      if (filterState.template_id) {
        params.set('template_id', filterState.template_id.join(','));
      }
      if (filterState.inventory_id) {
        params.set('inventory_id', filterState.inventory_id.join(','));
      }
      // if (filterState.quick_date_range) {
      //   params.set('quick_date_range', filterState.quick_date_range.join(','));
      // }
    }
    setSearchParams(params);
  }, [filterState, page, perPage, setSearchParams, sortOption, sortOrder]);

  const requestBody = useMemo(
    () => ({
      status: ['successful'],
      org_id: filterState.org_id ?? [],
      cluster_id: filterState.cluster_id ?? [],
      template_id: filterState.template_id ?? [],
      inventory_id: filterState.inventory_id ?? [],
      quick_date_range:
        filterState.quick_date_range && filterState.quick_date_range.length
          ? filterState.quick_date_range[0]
          : 'roi_last_year',
      job_type: ['job'],
      sort_options: sortOption.value,
      sort_order: sortOrder,
      start_date: undefined, // TODO
      end_date: undefined, // TODO
      limit: perPage.toString(),
      offset: ((page - 1) * perPage).toString(),
      only_root_workflows_and_standalone_jobs: true,
      template_weigh_in: undefined,
      attributes: [
        'elapsed',
        'host_count',
        'total_count',
        'total_org_count',
        'total_cluster_count',
        'successful_hosts_total',
        'successful_elapsed_total',
      ],
      group_by: 'template',
      group_by_time: false,
    }),
    [filterState, page, perPage, sortOption.value, sortOrder]
  );

  const [data, setData] = useState<ReportDataResponse>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const abortController = new AbortController();
    setIsLoading(true);
    requestPost<ReportDataResponse>(
      `/api/v2/analytics/roi_templates/?limit=${perPage}&offset=${(page - 1) * perPage}&sort_by=${
        sortOption?.value
      }${encodeURIComponent(`:${sortOrder}`)}`,
      requestBody,
      abortController.signal
    )
      .then((response) => {
        if (abortController.signal.aborted) return;
        setData(response);
        setIsLoading(false);
        setError(undefined);
      })
      .catch((err) => {
        if (abortController.signal.aborted) return;
        setError(err as Error);
        setIsLoading(false);
        setData(undefined);
      });
    return () => abortController.abort();
  }, [page, perPage, sortOption.value, sortOrder, requestBody]);

  const formattedValue = (key: string, value: number) => {
    let val;
    switch (key) {
      case 'elapsed':
        val = value.toFixed(2) + ' seconds';
        break;
      case 'template_automation_percentage':
        val = value.toFixed(2) + '%';
        break;
      case 'successful_hosts_savings':
      case 'failed_hosts_costs':
      case 'monetary_gain':
        val = currencyFormatter(value);
        break;
      default:
        val = value.toFixed(2);
    }
    return val;
  };

  const chartParams = {
    y: sortOption.value,
    tooltip: 'Savings for',
    field: sortOption.value,
    label: sortOption.label || 'Label Y',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customTooltipFormatting = ({ datum }: { datum: Record<string, any> }) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const tooltip = `${chartParams.label.toString() || ''} for ${datum.name || ''}: ${
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      formattedValue('successful_hosts_savings', datum.y) || ''
    }`;
    return tooltip;
  };

  const renderLeft = () => (
    <Card isPlain>
      <CardHeader>
        <CardTitle>{t('Automation savings')}</CardTitle>
      </CardHeader>
      {!data || data?.meta?.legend.length === 0 ? (
        <EmptyStateFilter clearAllFilters={() => null /* TODO*/} />
      ) : (
        <Chart
          schema={hydrateSchema(schema)(chartParams)}
          data={{ items: data?.meta?.legend }}
          specificFunctions={{ labelFormat: { customTooltipFormatting } }}
        />
      )}
    </Card>
  );

  const renderRight = () => (
    <Stack>
      <StackItem>
        <TotalSavings
          totalSavings={
            (data?.monetary_gain_other_pages || 0) + (data?.monetary_gain_current_page || 0)
          }
          currentPageSavings={data?.monetary_gain_current_page || 0}
          isLoading={isLoading}
        />
      </StackItem>
      <StackItem>
        <CalculationCost
          costManual={data?.cost.hourly_manual_labor_cost || 0}
          setFromCalculation={() => null}
          costAutomation={data?.cost.hourly_automation_cost || 0}
          readOnly={true}
        />
      </StackItem>
      <StackItem>
        <AutomationFormula />
      </StackItem>
    </Stack>
  );

  if (isLoading) {
    return <LoadingState />;
  } else if (error) {
    return <AnalyticsErrorState error={error.message} />;
  }

  return (
    <>
      <Scrollable>
        <PageSection>
          <Card isRounded>
            <CardBody>
              <Grid hasGutter>
                <GridItem span={9}>{!isLoading && renderLeft()}</GridItem>
                <GridItem span={3}>{!isLoading && renderRight()}</GridItem>
              </Grid>
            </CardBody>
            <TemplatesTable
              data={data?.meta.legend || []}
              variableRow={{
                key: sortOption.value,
                ...sortOption,
              }}
              readOnly={true}
              getSortParams={{
                sort: {
                  sortBy: {
                    index: 1,
                    direction: sortOrder,
                  },
                  onSort: (_event, _index, direction) => setSortOrder(direction),
                  columnIndex: 1,
                },
              }}
            />
          </Card>
        </PageSection>
      </Scrollable>
      <Pagination
        itemCount={data?.meta.count}
        page={page}
        perPage={perPage}
        perPageOptions={perPageOptions}
        onPerPageSelect={(_e, perPage: number) => setPerPage(perPage)}
        onSetPage={(_e, page: number) => setPage(page)}
        variant={PaginationVariant.bottom}
      />
    </>
  );
}

interface SortOption {
  label: string;
  value: string;
}

const perPageOptions = [4, 6, 8, 10, 15, 20, 25].map((value) => ({
  title: value.toString(),
  value,
}));
