import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useGetRequest } from '../../../common/crud/useGet';
import { useState, useEffect } from 'react';
import { useAnalyticsBuilderView, IAnalyticsBuilderView } from '../useAnalyticsBuilderView';
import { PageTable } from '../../../../framework/PageTable/PageTable';
import { ITableColumn, ITableColumnTypeText } from '../../../../framework';
import {
  IToolbarFilter,
  ToolbarFilterType,
} from '../../../../framework/PageToolbar/PageToolbarFilter';
import Chart from '../components/Chart';
import hydrateSchema from '../components/Chart/hydrateSchema';

import { ColumnTableOption } from '../../../../framework/PageTable/PageTableColumn';
import { IToolbarMultiSelectFilter } from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarMultiSelectFilter';
import { useLocation } from 'react-router-dom';

import { ChartFunctions } from '@ansible/react-json-chart-builder';

type KeyValue = { key: string; value: string };

export interface MainDataDefinition {
  report: {
    tableHeaders: [{ key: string; value: string }];

    layoutProps: {
      // TODO - fix in API
      dataEndpoint: string;
      optionsEndpoint: string;

      schema: ObjectType;
    };

    availableChartTypes?: string[];
  };
}

export type ObjectType = AnyType;
export type AnyType = any;

export interface OptionsDefinition {
  sort_options: KeyValue[];
  group_by: KeyValue[];
  quick_date_range: KeyValue[];
  granularity: KeyValue[];
  [key: string]: AnyType;
}

export interface DefaultDataParams {
  sort_options?: string;
  quick_date_range?: string;
  group_by?: string;
  granularity?: string;
  [key: string]: AnyType;
}

export interface AnalyticsBuilderProps {
  main_url: string;

  // used for processing and adding, or modyfying some data that came from the server and are not complete
  processMainData?: (props: AnalyticsBuilderProps, mainData: MainDataDefinition) => void;
  processOptions?: (props: AnalyticsBuilderProps, options: OptionsDefinition) => void;

  // on the fly postprocessing of default params
  processOptionsRequestPayload?: (props: AnalyticsBuilderProps, data: ObjectType) => void;

  // default post data params
  defaultDataParams?: DefaultDataParams;

  // on the fly postprocessing of default params
  processDataRequestPayload?: (props: AnalyticsBuilderProps, data: ObjectType) => void;

  // used for final modifying of columns before they are passed into the table and view
  processTableColumns?: (props: AnalyticsBodyProps, columns: ITableColumn<ObjectType>[]) => void;

  // default item.id
  rowKeyFn?: (item: ObjectType) => string | number;
}

export interface AnalyticsBodyProps extends AnalyticsBuilderProps {
  mainData: MainDataDefinition;
  options: OptionsDefinition;
}

export interface AnalyticsTableProps extends AnalyticsBodyProps {
  tableColumns: ITableColumn<ObjectType>[];
  view: IAnalyticsBuilderView<ObjectType>;
  toolbarFilters: IToolbarFilter[];
}

interface AnalyticsColumnBuilderProps extends AnalyticsBodyProps {
  view: IAnalyticsBuilderView<ObjectType>;
}

export function FillDefaultProps(props: AnalyticsBuilderProps) {
  // set id function as default
  if (!props.rowKeyFn) {
    props.rowKeyFn = (item: { id: number }) => item.id;
  }
}

// swamps endpoint path from old path using v1 version and tower analytics. Example
// /api/tower-analytics/v1/report/hosts_by_organization/
// transforms to
// /api/v2/analytics/report/hosts_by_organization/
function transformEndpoint(url: string) {
  const urls = url.split('/');
  for (let id = 0; id < urls.length; id++) {
    const val = urls[id];

    if (val == 'tower-analytics') {
      urls[id] = 'analytics';
      continue;
    }

    if (val == 'v1') {
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

export function AnalyticsBuilder(props: AnalyticsBuilderProps) {
  const [mainData, setMainData] = useState<MainDataDefinition | null>(null);
  const [options, setOptions] = useState<OptionsDefinition | null>(null);
  const [error, setError] = useState<AnyType>(null);

  const post = usePostRequest();
  const get = useGetRequest();

  async function readData() {
    try {
      const result = (await get(props.main_url, {})) as MainDataDefinition;
      result.report.layoutProps.dataEndpoint = transformEndpoint(
        result.report.layoutProps.dataEndpoint
      );
      result.report.layoutProps.optionsEndpoint = transformEndpoint(
        result.report.layoutProps.optionsEndpoint
      );

      props.processMainData?.(props, result);
      setMainData(result);

      readOptions(result);
    } catch (error) {
      setError(error);
    }
  }

  async function readOptions(mainData: MainDataDefinition) {
    try {
      let optionsPayload = props.defaultDataParams || {};
      props.processOptionsRequestPayload?.(props, optionsPayload);

      const result2 = (await post(
        mainData.report.layoutProps.optionsEndpoint,
        optionsPayload
      )) as OptionsDefinition;
      props.processOptions?.(props, result2);
      setOptions(result2);
    } catch (error) {
      setError(error);
    }
  }

  useEffect(() => {
    readData();
  }, []);

  if (mainData && options) {
    return <AnalyticsBody mainData={mainData} options={options} {...props} />;
  }

  return <>Analytics builder - loading {error && 'Some error ocurred'}</>;
}

function AnalyticsBody(props: AnalyticsBodyProps) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  let sortableColumns = getAvailableSortingKeys(props);

  const filters = buildTableFilters(props, queryParams);

  const view = useAnalyticsBuilderView<ObjectType>({
    url: props.mainData.report.layoutProps.dataEndpoint,
    keyFn: props.rowKeyFn ? props.rowKeyFn : () => 0,
    builderProps: props,
    sortableColumns,
    toolbarFilters: filters,
  });

  const newProps = { ...props, view };

  const columns = buildTableColumns({ ...newProps }) as ITableColumn<ObjectType>[];

  return (
    <>
      Analytics builder - body
      <AnalyticsTable
        {...newProps}
        tableColumns={columns}
        toolbarFilters={filters}
      ></AnalyticsTable>
    </>
  );
}

function AnalyticsTable(props: AnalyticsTableProps) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  let sortOption = queryParams.get('sort');

  // fix the desc sorting with prefix -
  if (sortOption && sortOption.length > 0 && sortOption[0] == '-') {
    sortOption = sortOption.substring(1);
  }

  if (!sortOption) {
    sortOption = props.defaultDataParams?.sort_options || '';
  }

  const availableChartTypes = props.mainData.report?.availableChartTypes;

  const customTooltipFormatting = ({ datum }: { datum: Record<string, any> }) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const tooltip = `${sortOption} for ${datum.name || ''}: ${
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      formattedValue('successful_hosts_savings', datum.y) || ''
    }`;
    return tooltip;
  };

  const specificFunctions: ChartFunctions = {
    labelFormat: { customTooltipFormatting },
    onClick: { handleClick: () => {} },
    axisFormat: {},
    style: {},
    dataComponent: {},
  };

  return (
    <PageTable<ObjectType>
      {...props.view}
      errorStateTitle="some error title"
      emptyStateTitle="empty state title"
      tableColumns={props.tableColumns || []}
      toolbarFilters={props.toolbarFilters}
      scrollTopContent={true}
      topContent={
        <Chart
          schema={hydrateSchema(props.mainData.report.layoutProps.schema)({
            y: sortOption,
            tooltip: 'Savings for',
            field: sortOption,
            label: props.options?.sort_options?.find((item) => item.key == sortOption)?.value,
            xTickFormat: getDateFormatByGranularity(props.defaultDataParams?.granularity || ''),
            chartType:
              availableChartTypes && availableChartTypes.length > 0
                ? availableChartTypes?.[0]
                : ('line' as ObjectType),
          })}
          data={props.view.originalData as AnyType}
          specificFunctions={specificFunctions}
        />
      }
    />
  );
}

// those columns are for view only, for sorting
function getAvailableSortingKeys(params: AnalyticsBodyProps) {
  const sortKeys: string[] = [];

  // set sort by
  if (params.options.sort_options) {
    for (const sort of params.options.sort_options) {
      sortKeys.push(sort.key);
    }
  }

  return sortKeys;
}

function buildTableFilters(params: AnalyticsBodyProps, queryParams: URLSearchParams) {
  const filters: IToolbarFilter[] = [];

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
    granularityOptions = params.options.granularity.map((item) => {
      return { key: item.key, value: item.key, label: item.value };
    });
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
    quickDateRangeOptions = params.options.quick_date_range.map((item) => {
      return { key: item.key, value: item.key, label: item.value };
    });
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

export function computeMainFilterKeys(params: AnalyticsBodyProps) {
  let items: { key: string; value: string }[] = [];

  if (params.options.group_by && Array.isArray(params.options.group_by)) {
    items = params.options.group_by.map((item) => {
      return { key: item.key + '_id', value: item.value };
    });
  }

  if (items.length == 0) {
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
    /*for (const key in postParams) {
      const postParam = postParams[key];
      if (Array.isArray(postParam) && options) {
        // determine if it matches the options
        const found = Object.keys(options).find((item) => item == key);
        if (found) {
          // add it to the items keys
          items.push(key);
        }
      }
    }*/
  }

  return items;
}

function buildTableColumns(params: AnalyticsColumnBuilderProps) {
  const columns: ITableColumn<ObjectType>[] = [];

  if (!params.view?.pageItems) {
    return columns;
  }

  // initialy create columns by table headers so they are in fixed positions
  if (params.mainData?.report.tableHeaders && params.mainData.report.tableHeaders.length > 0) {
    for (const tableHeader of params.mainData.report.tableHeaders) {
      let column = {} as ITableColumnTypeText<ObjectType>;
      column.id = tableHeader.key;
      column.type = 'text';
      columns.push(column);
    }
  }

  // create columns initialy by incomming data
  if (params.view.pageItems.length > 0) {
    const obj = params.view.pageItems[0];

    // loop over obj items
    for (let key in obj) {
      let alreadyExist = columns.find((item) => item.id == key);

      let column = {} as ITableColumn<ObjectType>;

      if (alreadyExist) {
        column = alreadyExist;
      }
      column.type = 'text';
      if (!column.header) {
        column.header = key;
      }
      column.value = (item) => item[key] as string;
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
      const col = columns.find((item) => item.id == tableHeader.key);

      if (col) {
        col.header = tableHeader.value + '(' + tableHeader.key + ')';
      }
    }

    // hide all columns into expanded that are not in table Header
    for (const col of columns) {
      let found = params.mainData?.report?.tableHeaders?.find((item) => item.key == col.id);
      if (!found) {
        col.table = ColumnTableOption.Expanded;
      }
    }
  }

  // set sort by
  if (params.options.sort_options) {
    for (const sort of params.options.sort_options) {
      const col = columns.find((item) => item.id == sort.key);

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

const currencyFormatter = (n: number): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return formatter.format(n); /* $2,500.00 */
};

const getDateFormatByGranularity = (granularity: string): string => {
  if (granularity === 'yearly') return 'formatAsYear';
  if (granularity === 'monthly') return 'formatAsMonth';
  if (granularity === 'daily') return 'formatDateAsDayMonth';
  return '';
};
