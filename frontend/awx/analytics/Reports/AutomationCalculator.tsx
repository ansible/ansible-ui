import {
  Bullseye,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Grid,
  GridItem,
  PageSection,
  Pagination,
  PaginationVariant,
  Spinner,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant,
} from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartLegendEntry, ChartSchemaElement } from 'react-json-chart-builder';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';
import { FilterState, PageTableToolbar, Scrollable } from '../../../../framework';
import { IToolbarSelectFilter } from '../../../../framework/PageTable/PageToolbar/PageToolbarFilterTypes/ToolbarSelectFilter';
import { EmptyStateFilter } from '../../../../framework/components/EmptyStateFilter';
import { postRequest as requestPost } from '../../../common/crud/Data';
import Chart from '../components/Chart';
import hydrateSchema from '../components/Chart/hydrateSchema';
import FilterableToolbarItem from '../components/Toolbar/Toolbar';
import { optionsForCategories } from '../components/Toolbar/constants';
import { ApiOptionsType, AttributeType } from '../components/Toolbar/types';
import currencyFormatter from '../utilities/currencyFormatter';
import AutomationFormula from './AutomationFormula';
import CalculationCost from './CalculationCost';
import { AnalyticsErrorState } from './ErrorStates';
import TemplatesTable from './TemplatesTable';
import TotalSavings from './TotalSavings';

const SpinnerDiv = styled.div`
  height: 400px;
  padding-top: 200px;
  padding-left: 400px;
`;

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

export default function AutomationCalculator(props: { schema: ChartSchemaElement[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const schema = props.schema;

  const [specificError, setSpecificError] = useState<string>('');

  const defaultParams: ParamsType = {
    status: ['successful'],
    org_id: [],
    cluster_id: [],
    template_id: [],
    inventory_id: [],
    quick_date_range: 'roi_last_year',
    job_type: ['job'],
    sort_options: 'successful_hosts_savings',
    sort_order: 'desc',
    start_date: undefined,
    end_date: undefined,
    limit: '6',
    offset: '0',
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
  };

  const getParams = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const params: Record<string, string[] | string> = JSON.parse(JSON.stringify(defaultParams));
    Object.keys(defaultParams).forEach((key) => {
      const value = [
        'job_type',
        'inventory_id',
        'template_id',
        'cluster_id',
        'org_id',
        'status',
      ].includes(key)
        ? searchParams.getAll(key)
        : searchParams.get(key);
      if (value) {
        params[key] = value;
      }
    });
    return params;
  };

  function paramsToFilterState(params: Record<string, string[] | string>): FilterState {
    const filterState: FilterState = {};
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        filterState[key] = value;
      } else {
        filterState[key] = [value];
      }
    }
    return filterState;
  }

  const updateSearchParams = (
    key: string | undefined,
    value: string | Array<string | number> | number | AttributeType | undefined
  ) => {
    if (!key) {
      const updatedSearchParams = new URLSearchParams('');
      setSearchParams(updatedSearchParams.toString());
      return;
    }
    const updatedSearchParams = new URLSearchParams(searchParams.toString());
    if (!value) {
      updatedSearchParams.delete(key);
    } else {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          updatedSearchParams.delete(key);
        } else {
          updatedSearchParams.delete(key);
          value.forEach((v) => updatedSearchParams.append(key, v.toString()));
        }
      } else {
        updatedSearchParams.set(key, value.toString());
      }
    }
    setSearchParams(updatedSearchParams.toString());
  };

  const updateSearchParamsFromFramework = (currentFilters: FilterState) => {
    const updatedSearchParams = new URLSearchParams(searchParams.toString());
    const keys = Object.keys(getParams()).filter(
      (key) =>
        ![
          'sort_options',
          'sort_by',
          'meta',
          'quick_date_range',
          'template_weigh_in',
          'parent_workflow',
          'manual_effort_reviewed',
          'attributes',
        ].includes(key)
    );
    keys.forEach((key) => {
      const value = currentFilters[key];
      if (!value) {
        updatedSearchParams.delete(key);
      } else {
        if (value.length === 0) {
          updatedSearchParams.delete(key);
        } else {
          updatedSearchParams.delete(key);
          if (Array.isArray(value)) {
            value.forEach((v) => updatedSearchParams.append(key, v.toString()));
          }
        }
      }
    });
    setSearchParams(updatedSearchParams.toString());
    return currentFilters;
  };

  const getOffset = (page: string, perPage: string | AttributeType): number => {
    return page === '0' ? 0 : (parseInt(page) - 1) * parseInt(perPage.toString());
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, error } = useSWR<ReportDataResponse, boolean, any>(
    `/api/v2/analytics/roi_templates/?limit=${searchParams.get('limit') || '6'}&offset=${getOffset(
      getParams().offset.toString(),
      getParams().limit
    )}&sort_by=${getParams().sort_options.toString()}${encodeURIComponent(
      `:${getParams().sort_order.toString()}`
    )}`,
    (url: string, json: unknown, signal: AbortSignal) => requestPost(url, getParams(), signal)
  );
  const {
    data: options,
    isLoading: optionsIsLoading,
    error: optionsError,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useSWR<ApiOptionsType, boolean, any>(`/api/v2/analytics/roi_templates_options/`, requestPost);

  useEffect(() => {
    if (!error && !optionsError) {
      setSpecificError('');
    } else {
      const err = error || optionsError;
      // @ts-expect-error: Cannot override type coming from useSWR
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      err?.response
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        .clone()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        .json()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        .then((r: { error?: { keyword?: string } }) =>
          setSpecificError(r?.error?.keyword || 'unknown')
        )
        .catch(() => setSpecificError('unknown'));
    }
  }, [error, optionsError]);

  // only interval <0,25> is supported by API
  const defaultPerPageOptions = [
    { title: '4', value: 4 },
    { title: '6', value: 6 },
    { title: '8', value: 8 },
    { title: '10', value: 10 },
    { title: '15', value: 15 },
    { title: '20', value: 20 },
    { title: '25', value: 25 },
  ];

  if (isLoading || optionsIsLoading)
    return (
      <PageSection isFilled>
        <Bullseye>
          <Spinner />
        </Bullseye>
      </PageSection>
    );

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
    y: getParams().sort_options,
    tooltip: 'Savings for',
    field: getParams().sort_options,
    label:
      options?.sort_options?.find(({ key }) => key === getParams().sort_options)?.value ||
      'Label Y',
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
      {isLoading && !!data ? (
        <SpinnerDiv>
          <Spinner data-cy={'spinner'} isSVG />
        </SpinnerDiv>
      ) : data?.meta?.legend.length === 0 ? (
        <EmptyStateFilter clearAllFilters={() => updateSearchParams(undefined, undefined)} />
      ) : (
        <Chart
          schema={hydrateSchema(schema)({
            label: chartParams.label.toString(),
            tooltip: chartParams.tooltip,
            field: chartParams.field,
          })}
          data={{
            items: data?.meta?.legend,
          }}
          specificFunctions={{
            labelFormat: {
              customTooltipFormatting,
            },
          }}
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
        <Stack>
          <StackItem>
            <CalculationCost
              costManual={data?.cost.hourly_manual_labor_cost || 0}
              setFromCalculation={() => {
                null;
              }}
              costAutomation={data?.cost.hourly_automation_cost || 0}
              readOnly={true}
            />
          </StackItem>
          <StackItem>
            <AutomationFormula />
          </StackItem>
        </Stack>
      </StackItem>
    </Stack>
  );
  // TODO mapping from AA to framework -> to be replaced by API fix
  const redoOptionValues = (option: { value: AttributeType; key: string }[]) => {
    return option.map((option) => {
      return { label: option.value.toString(), value: option.key };
    });
  };

  const sortOptions = !!options?.sort_options && redoOptionValues(options?.sort_options);
  const filterOptions: IToolbarSelectFilter[] = [];
  // TODO get nicer label
  Object.keys(options || {}).forEach((key) => {
    if (
      ![
        'sort_options',
        'sort_by',
        'meta',
        'quick_date_range',
        'template_weigh_in',
        'parent_workflow',
        'manual_effort_reviewed',
      ].includes(key) &&
      !!options
    ) {
      filterOptions.push({
        key: key,
        label: optionsForCategories[key].name,
        placeholder: optionsForCategories[key].placeholder,
        type: 'select',
        options: redoOptionValues(options[key]),
        hasSearch: true,
        query: '',
      });
    }
  });
  /* TODO add quick_date_range
  filterOptions.push({
    key: 'quick_date_range',
    label: optionsForCategories['quick_date_range'].name,
    placeholder: optionsForCategories['quick_date_range'].placeholder,
    type: 'dateWithOptions',
    options: redoOptionValues(options['quick_date_range']),
  });
   */

  return !!error || !!optionsError || !!specificError ? (
    <AnalyticsErrorState error={specificError} />
  ) : (
    <>
      <Toolbar
        className="border-bottom dark-2 pf-m-toggle-group-container"
        collapseListedFiltersBreakpoint="xl"
        clearAllFilters={() => updateSearchParams(undefined, undefined)}
        data-cy={'filter-toolbar'}
      >
        <ToolbarContent>
          {!optionsIsLoading && !optionsError && (
            <FilterableToolbarItem
              categories={options as ApiOptionsType}
              filters={getParams()}
              setFilters={(key, value) => updateSearchParams(key, value)}
            />
          )}
          <ToolbarItem
            data-cy={'top_pagination'}
            variant={ToolbarItemVariant.pagination}
            visibility={{ default: 'hidden', lg: 'visible' }}
          >
            <Pagination
              itemCount={data?.meta.count}
              perPageOptions={defaultPerPageOptions}
              perPage={parseInt(searchParams.get('limit') || '20')}
              page={parseInt(searchParams.get('offset') || '1')}
              onPerPageSelect={(_e, perPage: number) => {
                updateSearchParams('limit', perPage.toString());
              }}
              onSetPage={(_e, page: number) => {
                updateSearchParams('offset', page.toString());
              }}
              isCompact
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <PageTableToolbar
        itemCount={data?.meta.count}
        perPage={parseInt(searchParams.get('limit') || '20')}
        page={parseInt(searchParams.get('offset') || '1')}
        setPage={(page: number) => {
          updateSearchParams('offset', page.toString());
        }}
        setPerPage={(perPage: number) => {
          updateSearchParams('limit', perPage.toString());
        }}
        // perPageOptions TODO add this as AC is not allowing 50 and 100

        sort={searchParams.get('sort_options') || 'successful_hosts_savings'}
        setSort={(sort: string) => {
          updateSearchParams('sort_options', sort);
        }}
        sortDirection={searchParams.get('sort_order')?.toString() === 'asc' ? 'asc' : 'desc'}
        setSortDirection={(sortDirection: 'asc' | 'desc') =>
          updateSearchParams('sort_order', sortDirection)
        }
        sortOptions={sortOptions || []}
        toolbarFilters={filterOptions}
        // TODO all three need fixing to correct one
        filters={paramsToFilterState(getParams())}
        // setFilters is a function that returns a function that takes a FilterState and returns a new FilterState
        // this follows the pattern of react useState setter functions
        setFilters={() => (currentFilters: FilterState) =>
          updateSearchParamsFromFramework(currentFilters)}
        clearAllFilters={() => updateSearchParams(undefined, undefined)}
        viewType={'cards'}
        setViewType={() => 'cards'} // TODO not needed
        keyFn={(t) => t.toString()}
        disableCardView
        disableColumnManagement
        disableListView
        disableTableView
      />
      <Scrollable>
        <PageSection>
          <Card>
            <CardBody>
              <Grid hasGutter>
                <GridItem span={9}>{!isLoading && renderLeft()}</GridItem>
                <GridItem span={3}>{!isLoading && renderRight()}</GridItem>
                <GridItem span={12}>
                  {isLoading ? (
                    <>
                      <p>{t('Enter the time it takes to run the following templates manually.')}</p>
                      <Spinner data-cy={'spinner'} isSVG />
                    </>
                  ) : (
                    <TemplatesTable
                      data={data?.meta.legend || []}
                      variableRow={{
                        key: getParams().sort_options.toString(),
                        value:
                          options?.sort_options
                            .find((x) => x.key === getParams().sort_options.toString())
                            ?.value.toString() || '',
                      }}
                      readOnly={true}
                      getSortParams={{
                        sort: {
                          sortBy: {
                            index: 1,
                            direction:
                              getParams().sort_order.toString() === 'desc' ? 'desc' : 'asc',
                          },
                          onSort: () =>
                            updateSearchParams(
                              'sort_order',
                              getParams().sort_order.toString() !== 'desc' ? 'desc' : 'asc'
                            ),
                          columnIndex: 1,
                        },
                      }}
                    />
                  )}
                </GridItem>
              </Grid>
            </CardBody>
            <CardFooter></CardFooter>
          </Card>
        </PageSection>
      </Scrollable>
      <Pagination
        itemCount={data?.meta.count}
        perPageOptions={defaultPerPageOptions}
        perPage={parseInt(searchParams.get('limit') || '20')}
        page={parseInt(searchParams.get('offset') || '1')}
        onPerPageSelect={(_e, perPage: number) => {
          updateSearchParams('limit', perPage.toString());
        }}
        onSetPage={(_e, page: number) => {
          updateSearchParams('offset', page.toString());
        }}
        variant={PaginationVariant.bottom}
      />
    </>
  );
}
