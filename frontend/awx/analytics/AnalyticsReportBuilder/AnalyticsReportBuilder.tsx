/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/*

Report builder allows to create standardized reports that will contains:

Toolbar
Chart
Table

Toolbar and Table is from framework, Graph uses standard graph component of legacy analytics.
Many UI things are generated from API responses, because API returns quite a lots of metadata - information
about returned data such as information about the table columns and also info about the filters.

There are three requests:

1) Main request 
It returns basic info and also URL to options and data request. Main request is send only first time. It uses GET method.

Main request data structure is defined in MainDataDefinition type.

2) Options request 
Options are used as info for filters, they have to be sometimes reloaded, when some filter selection changes - for example granularity.
It uses POST method filled with parameters, that are now red from constants.ts file. But those parameters are sometimes modified
based on what user selected in filters.

Options request data structure is defined in OptionsDefinition type.

3) Data request
Returns data for graph and table, it is classic paginated request, but data structure is not that straightforward. It uses useAnalyticsReportBuilderView,
which uses POST method with the same parameters as options request. 

Data request data structure is defined in AnalyticsItemsResponse type.

Based on this data, AnalyticsReportBuilder creates PageTable with columns and filters and also graph, everythings is done based on data from API
and constants file. But it is also configurable. There are some callbacks in props that can change those data - add/modify/delete table columns,
modify filters, add some new columns contents into the table. If more flexibility is needed, it can be added in the future.

*/

import { ChartFunctions, ChartSchemaElement } from '@ansible/react-json-chart-builder';
import { PerPageOptions, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ITableColumn,
  ITableColumnTypeText,
  LoadingPage,
  PageHeader,
  PageLayout,
  usePageNavigate,
} from '../../../../framework';
import { PageTable } from '../../../../framework/PageTable/PageTable';
import { ColumnTableOption } from '../../../../framework/PageTable/PageTableColumn';
import {
  IToolbarFilter,
  ToolbarFilterType,
} from '../../../../framework/PageToolbar/PageToolbarFilter';
import { IToolbarMultiSelectFilter } from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarMultiSelectFilter';
import { useURLSearchParams } from '../../../../framework/components/useURLSearchParams';
import { useGetRequest } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AnalyticsErrorState } from '../Reports/ErrorStates';
import { Chart } from '../components/Chart';
import { hydrateSchema } from '../components/Chart/hydrateSchema';
import { IAnalyticsView, useAnalyticsView } from '../useAnalyticsView';
import {
  formattedValue,
  getClickableText,
  getDateFormatByGranularity,
  renderAllTasksStatus,
} from './AnalyticsReportBuilderUtils';
import { reportDefaultParams } from './constants';

type KeyValue = { key: string; value: string };

// definition of main data returned from main request
export interface MainDataDefinition {
  report: {
    // info about the tables
    tableHeaders: [{ key: string; value: string }];

    layoutProps: {
      // TODO - fix in API
      // path to data request
      dataEndpoint: string;
      // path to options request
      optionsEndpoint: string;

      // some info for chart
      schema: ChartSchemaElement[];

      // available chart types like bar or line
      availableChartTypes?: string[];

      clickableLinking: boolean;
    };
  };
}

export type AnyType = any;

// definition of options returned from options request
export interface OptionsDefinition {
  sort_options: KeyValue[];
  group_by: KeyValue[];
  quick_date_range: KeyValue[];
  granularity: KeyValue[];
  [key: string]: AnyType;
}

// definition of object that is passed as payload to options and data POST request
export interface DefaultDataParams {
  sort_options?: string;
  quick_date_range?: string;
  group_by?: string;
  granularity?: string;
  [key: string]: AnyType;
}

// Props of whole builder component
export interface AnalyticsReportBuilderProps {
  // name of the report
  report_name: string;

  // url of the main data
  main_url: string;

  // hides table
  previewMode?: boolean;

  // used for processing and adding, or modyfying some data that came from the server and are not complete
  // developer can pass this method and change those props inside
  // notice that those props are copy of component original props, so they can be modified
  processMainData?: (props: AnalyticsReportBuilderProps, mainData: MainDataDefinition) => void;
  processOptions?: (props: AnalyticsReportBuilderProps, options: OptionsDefinition) => void;

  // on the fly postprocessing of default params
  processOptionsRequestPayload?: (props: AnalyticsReportBuilderProps, data: AnyType) => void;

  // on the fly postprocessing of default params
  processDataRequestPayload?: (props: AnalyticsReportBuilderProps, data: AnyType) => void;

  // used for final modifying of columns before they are passed into the table and view
  // can modify columns - modify content, add content, add new columns, delete columns, reorder columns
  processTableColumns?: (
    props: AnalyticsReportBuilderBodyProps,
    columns: ITableColumn<AnyType>[]
  ) => void;

  // default item.id
  rowKeyFn?: (item: AnyType) => string | number;

  // navigation
  navigate: ReturnType<typeof usePageNavigate>;
}

// Extended props for body component, it also contains mainData and options from API
// Body component is rendered after mainData and options returned from API
export interface AnalyticsReportBuilderBodyProps extends AnalyticsReportBuilderProps {
  mainData?: MainDataDefinition;
  options?: OptionsDefinition;

  // default post data params
  defaultDataParams?: DefaultDataParams;
}

// extended props for table, it contains tableColumns, view and filters
export interface AnalyticsTableProps extends AnalyticsReportBuilderBodyProps {
  tableColumns: ITableColumn<AnyType>[];
  view: IAnalyticsView<AnyType>;
  toolbarFilters: IToolbarFilter[];
}

// props for function that creates framework table columns from API data
interface AnalyticsReportColumnBuilderProps extends AnalyticsReportBuilderBodyProps {
  view: IAnalyticsReportBuilderView<AnyType>;
}

// function dat fills some default props, can be used externaly when using AnalyticsReportBuilder component
// for example, this creates item.id as default identifier, but in some cases, this can be different
export function FillDefaultProps(props: AnalyticsReportBuilderProps) {
  // set id function as default
  if (!props.rowKeyFn) {
    props.rowKeyFn = (item) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return item.id;
    };
  }
}

// swamps endpoint path from old path using v1 version and tower analytics. Example
// /api/tower-analytics/v1/report/hosts_by_organization/
// transforms to
// awxAPI`/analytics/report/hosts_by_organization/`
function transformEndpoint(url: string) {
  const urls = url.split('/');
  for (let id = 0; id < urls.length; id++) {
    const val = urls[id];

    if (val === 'tower-analytics') {
      urls[id] = 'analytics';
      continue;
    }

    if (val === 'v1') {
      // change path - swap analytics and version set to v2
      if (id - 1 >= 0) {
        const store = urls[id - 1];
        urls[id - 1] = 'v2';
        urls[id] = store;
      }
      break;
    }
  }

  return urls.join('/');
}

// main component, handles main and options request
export function AnalyticsReportBuilder(props: AnalyticsReportBuilderProps) {
  const [mainData, setMainData] = useState<MainDataDefinition | undefined>(undefined);
  const [options, setOptions] = useState<OptionsDefinition | undefined>(undefined);
  const [error, setError] = useState<unknown>(undefined);

  // create copy of initial props so we can modify them if needed
  const parameters: AnalyticsReportBuilderBodyProps = { ...props, mainData, options };
  parameters.defaultDataParams = reportDefaultParams(props.report_name);

  const post = usePostRequest();
  const get = useGetRequest();

  const navigate = usePageNavigate();
  parameters.navigate = navigate;

  const [searchParams] = useURLSearchParams();
  const granularityParam =
    searchParams.get('granularity') || parameters.defaultDataParams?.granularity || '';

  // reads main data
  async function readMainData() {
    try {
      const result = (await get(parameters.main_url, {})) as MainDataDefinition;

      // transforms URL to valid urls, this behvaior can be changed in processMainData callback
      // by rewriting the path - for example to pass correct path, if needed
      result.report.layoutProps.dataEndpoint = transformEndpoint(
        result.report.layoutProps.dataEndpoint
      );
      result.report.layoutProps.optionsEndpoint = transformEndpoint(
        result.report.layoutProps.optionsEndpoint
      );

      // callback that is passed as props, change any main data if needed
      parameters.processMainData?.(parameters, result);
      setMainData(result);

      await readOptions(result);
    } catch (error) {
      setError(error);
    }
  }

  // reads options
  async function readOptions(mainData?: MainDataDefinition) {
    try {
      if (!mainData) {
        return;
      }

      // default data params are usualy from constants.ts, TODO - may be handled in the component itself and not as props
      const optionsPayload = parameters.defaultDataParams || {};
      // ensure that granularity is up to date, param is from URL
      optionsPayload.granularity = granularityParam;

      // modify payload if needed
      parameters.processOptionsRequestPayload?.(parameters, optionsPayload);

      const result2 = (await post(
        mainData.report.layoutProps.optionsEndpoint,
        optionsPayload
      )) as OptionsDefinition;
      parameters.processOptions?.(parameters, result2);
      setOptions(result2);
    } catch (error) {
      setError(error);
    }
  }

  // read main data if it is empty
  useEffect(() => {
    if (mainData) {
      return;
    }

    void (async () => {
      await readMainData();
    })();
  });

  // granularity - for example monthly, yearly, daily
  const [granularity, setGranularity] = useState<string>(granularityParam || '');

  // if granularity param changes, we have to load options again, because it will return new filter options for new granularity
  if (granularityParam !== granularity) {
    setGranularity(granularityParam);
    void (async () => {
      await readOptions(mainData);
    })();
  }

  // which columns are sortable
  const sortableColumns = getAvailableSortingKeys(parameters);

  // build filters for toolbar
  const filters = buildTableFilters(parameters);

  // view that reads the data
  const view = useAnalyticsView<AnyType>({
    url: parameters.mainData?.report.layoutProps.dataEndpoint || '',
    keyFn: parameters.rowKeyFn ? parameters.rowKeyFn : () => 0,
    builderProps: parameters,
    sortableColumns,
    toolbarFilters: filters,
    disableLoading: !(options && mainData),
    requestMethod: 'post',
    getItemsCount: (data) => data?.meta.count,
    getItems: (data) => data?.meta.legend,
  });

  const newProps = { ...parameters, view };

  // build the table columns
  const columns = buildTableColumns({ ...newProps });

  // Render error state based on the error message
  if (error) {
    return <AnalyticsErrorState error={error?.body?.error?.keyword || 'unknown'} />;
  }

  // and finaly, render the table with chart and filters
  return (
    <>
      {mainData && options && view.pageItems?.length > 0 && (
        <PageLayout>
          <PageHeader
            title={mainData?.report?.name || ''}
            description={mainData?.report?.description || ''}
          />
          <AnalyticsReportBuilderTable
            {...newProps}
            tableColumns={columns}
            toolbarFilters={filters}
          ></AnalyticsReportBuilderTable>
        </PageLayout>
      )}
      {(!mainData || !options) && view.pageItems?.length === 0 && <LoadingPage />}
    </>
  );
}

// render the table with chart and filters
function AnalyticsReportBuilderTable(props: AnalyticsTableProps) {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const availableChartTypes = props.mainData?.report?.layoutProps.availableChartTypes;
  const [chartType, setChartType] = useState<string>(
    (availableChartTypes && availableChartTypes.length > 0 && availableChartTypes[0]) || 'line'
  );

  let sortOption = queryParams.get('sort');

  // fix the desc sorting with prefix -
  if (sortOption && sortOption.length > 0 && sortOption[0] === '-') {
    sortOption = sortOption.substring(1);
  }

  if (!sortOption) {
    sortOption = props.defaultDataParams?.sort_options || '';
  }

  // some function for chart
  const customTooltipFormatting = ({ datum }: { datum: Record<string, AnyType> }) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const tooltip = `${sortOption} for ${datum.name || ''}: ${
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      formattedValue('successful_hosts_savings', datum.y) || ''
    }`;
    return tooltip;
  };

  // some functions for chart
  const specificFunctions: ChartFunctions = {
    labelFormat: { customTooltipFormatting },
    onClick: { handleClick: () => {} },
    axisFormat: {},
    style: {},
    dataComponent: {},
  };

  let perPageOptions: PerPageOptions[] = [];

  // set page options that are different from framework defaults (in fact, those defaults are from patternfly component itself)
  if (props.report_name === 'automation_calculator') {
    perPageOptions = [4, 6, 8, 10, 15, 20, 25].map((item) => {
      return { title: item, value: item };
    });
  } else {
    perPageOptions = [4, 6, 8, 10].map((item) => {
      return { title: item, value: item };
    });
  }

  // render the table and chart
  return (
    <PageTable<AnyType>
      {...props.view}
      expandedRow={(item) => renderAllTasksStatus(item, props)}
      perPageOptions={perPageOptions}
      errorStateTitle="some error title"
      emptyStateTitle="empty state title"
      tableColumns={props.tableColumns || []}
      toolbarFilters={props.toolbarFilters}
      scrollTopContent={true}
      hideTable={props.previewMode}
      topContent={
        props.view.originalData && (
          <Chart
            schema={hydrateSchema(
              props.mainData?.report?.layoutProps?.schema || ([] as ChartSchemaElement[])
            )({
              y: sortOption,
              tooltip: 'Savings for',
              field: sortOption,
              label: props.options?.sort_options?.find((item) => item.key === sortOption)?.value,
              xTickFormat: getDateFormatByGranularity(props.defaultDataParams?.granularity || ''),
              chartType: chartType as AnyType,
            })}
            data={props.view.originalData as AnyType}
            specificFunctions={specificFunctions}
          />
        )
      }
      toolbarContent={
        availableChartTypes &&
        availableChartTypes.length > 1 && (
          <ToggleGroup aria-label="Chart type toggle" key="chart-toggle">
            {availableChartTypes.map((chartTypeItem) => (
              <ToggleGroupItem
                key={chartTypeItem}
                data-cy={'chart_type'}
                text={`${capitalize(chartTypeItem)} Chart`}
                buttonId={chartTypeItem}
                isSelected={chartTypeItem === chartType}
                onChange={() => {
                  setChartType(chartTypeItem);
                }}
              />
            ))}
          </ToggleGroup>
        )
      }
    />
  );
}

function capitalize(string: string) {
  if (string.length === 0) {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// those columns are for view only, for sorting
function getAvailableSortingKeys(params: AnalyticsReportBuilderBodyProps) {
  const sortKeys: string[] = [];

  // set sort by
  if (params.options?.sort_options) {
    for (const sort of params.options.sort_options) {
      sortKeys.push(sort.key);
    }
  }

  return sortKeys;
}

// builds filters
function buildTableFilters(params: AnalyticsReportBuilderBodyProps) {
  const filters: IToolbarFilter[] = [];

  // main filters - those are the leftmost filters. That will create two filters - one (leftmost) that switches between
  // filter types and second is the currently selected filter
  // granularity and date range selections are added separately. This is distinguished by isPinned : true
  const mainFilters = computeMainFilterKeys(params);

  for (const mainFilter of mainFilters) {
    const paramOption = params?.options?.[mainFilter.key] as { key: string; value: string }[];
    const options = paramOption?.map((item) => {
      return { key: item.key, value: item.key, label: item.value };
    });

    if (options) {
      const filter: IToolbarMultiSelectFilter = {
        key: mainFilter.key,
        type: ToolbarFilterType.MultiSelect,
        options: options,
        query: mainFilter.key,
        label: mainFilter.value,
        placeholder: 'Select',
      };

      filters.push(filter);
    }
  }

  // granularity
  const granularity = 'granularity';
  let granularityOptions = [];

  if (Array.isArray(params?.options?.granularity)) {
    granularityOptions =
      params.options?.granularity.map((item) => {
        return { key: item.key, value: item.key, label: item.value };
      }) || [];
    filters.push({
      key: granularity,
      type: ToolbarFilterType.SingleSelect,
      options: granularityOptions,
      query: granularity,
      label: 'Granularity',
      placeholder: 'Select granularity',
      isPinned: true,
    });
  }

  // quick date range filter
  const quick_date_range = 'quick_date_range';
  let quickDateRangeOptions = [];

  if (Array.isArray(params?.options?.quick_date_range)) {
    quickDateRangeOptions =
      params.options?.quick_date_range.map((item) => {
        return { key: item.key, value: item.key, label: item.value };
      }) || [];
    filters.push({
      key: quick_date_range,
      type: ToolbarFilterType.SingleSelect,
      options: quickDateRangeOptions,
      query: quick_date_range,
      label: 'Quick Date Range',
      placeholder: 'Select quick date range',
      isPinned: true,
    });
  }

  return filters;
}

// this will return main filters created based on options data returned from options API
export function computeMainFilterKeys(params: AnalyticsReportBuilderBodyProps) {
  let items: { key: string; value: string }[] = [];

  if (params.options?.group_by && Array.isArray(params.options?.group_by)) {
    items = params.options?.group_by.map((item) => {
      return { key: item.key + '_id', value: item.value };
    });
  }

  if (items.length === 0) {
    // if group by missing, try to determine them automatically
    const postParams = params.defaultDataParams;
    if (!postParams) {
      return items;
    }

    const options = params.options;

    for (const option in options) {
      if (option.endsWith('_id')) {
        items.push({ key: option, value: option });
      }
    }
  }

  return items;
}

// build table columns from main data
function buildTableColumns(params: AnalyticsReportColumnBuilderProps) {
  const columns: ITableColumn<AnyType>[] = [];

  if (!params.view?.pageItems) {
    return columns;
  }

  // initialy create columns by table headers so they are in fixed positions
  if (params.mainData?.report.tableHeaders && params.mainData.report.tableHeaders.length > 0) {
    for (const tableHeader of params.mainData.report.tableHeaders) {
      const column = {} as ITableColumnTypeText<AnyType>;
      column.id = tableHeader.key;
      column.type = 'text';
      columns.push(column);
    }
  }

  // create columns initialy by incomming data. Those columns will be in expandable rows if not found in the table headers definition from main data
  if (params.view.pageItems.length > 0) {
    const obj = params.view?.pageItems?.[0];

    // loop over obj items
    for (const key in obj) {
      const alreadyExist = columns.find((item) => item.id === key);

      let column = {} as ITableColumn<AnyType>;

      if (alreadyExist) {
        column = alreadyExist;
      }

      column.type = 'text';
      if (!column.header) {
        column.header = key;
      }

      column.value = (item) => {
        let value = item[key] as string;
        // hyperlinks
        if (params.mainData?.report.layoutProps.clickableLinking) {
          value = getClickableText(item as Record<string, string | number>, key, params);
        }

        return value;
      };

      column.id = key;

      if (!alreadyExist) {
        columns.push(column);
      }
    }
  }

  // fine tune columns by tableHeaders if any
  if (params.mainData?.report.tableHeaders && params.mainData.report.tableHeaders.length > 0) {
    // set nice names
    for (const tableHeader of params.mainData.report.tableHeaders) {
      const col = columns.find((item) => item.id === tableHeader.key);

      if (col) {
        col.header = tableHeader.value + '(' + tableHeader.key + ')';
      }
    }

    // hide all columns into expanded that are not in table Header
    for (const col of columns) {
      const found = params.mainData?.report?.tableHeaders?.find((item) => item.key === col.id);
      if (!found) {
        col.table = ColumnTableOption.expanded;
      }
    }
  }

  // set sort by
  if (params.options?.sort_options) {
    for (const sort of params.options.sort_options) {
      const col = columns.find((item) => item.id === sort.key);

      if (col) {
        col.sort = col.id;
      }
    }
  }

  // ensure values are not missing
  for (const col of columns) {
    if (!col.value) {
      col.value = () => 'Value is missing in data';
    }
  }

  // another fine tunning done by outside config script
  params.processTableColumns?.(params, columns);

  return columns;
}
