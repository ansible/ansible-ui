import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useGetRequest } from '../../../common/crud/useGet';
import { useState, useEffect } from 'react';
import { useAnalyticsView, IAnalyticsView } from '../../analytics/useAnalyticsView';
import { PageTable } from '../../../../framework/PageTable/PageTable';
import { ITableColumn, ITableColumnTypeText } from '../../../../framework';
import {
  IToolbarFilter,
  ToolbarFilterType,
} from '../../../../framework/PageToolbar/PageToolbarFilter';
import { PageSelectOption } from '../../../../framework/PageInputs/PageSelectOption';

import { ColumnTableOption } from '../../../../framework/PageTable/PageTableColumn';
import { IToolbarSingleSelectFilter } from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarSingleSelectFilter';
import { useLocation } from 'react-router-dom';

const main_filter = 'main___filter';
const secondary_filter = 'secondary___filter';

export interface MainRequestDefinition {
  report: {
    tableHeaders: [{ key: string; value: string }];

    layoutProps: {
      // TODO - fix in API
      dataEndpoint: string;
      optionsEndpoint: string;
    };
  };
}

export type ObjectType = any;

export interface OptionsDefinition {
  sort_options: [{ key: string }];
  [key: string]: any;
}

export interface AnalyticsBuilderProps {
  main_url: string;

  // used for processing and adding, or modyfying some data that came from the server and are not complete
  processMainData?: (props: AnalyticsBuilderProps, mainData: MainRequestDefinition) => void;
  processOptions?: (props: AnalyticsBuilderProps, options: OptionsDefinition) => void;

  // default post options params
  defaultOptionsParams?: ObjectType;

  // on the fly postprocessing of default params
  processOptionsRequestPayload?: (props: AnalyticsBuilderProps, data: ObjectType) => void;

  // default post data params
  defaultDataParams?: ObjectType;

  // on the fly postprocessing of default params
  processDataRequestPayload?: (props: AnalyticsBuilderProps, data: ObjectType) => void;

  // used for final modifying of columns before they are passed into the table and view
  processTableColumns?: (props: AnalyticsBodyProps, columns: ITableColumn<ObjectType>[]) => void;

  // default item.id
  rowKeyFn?: (item: ObjectType) => string | number;
}

interface AnalyticsBodyProps extends AnalyticsBuilderProps {
  mainData: MainRequestDefinition;
  options: OptionsDefinition;
}

interface AnalyticsTableProps extends AnalyticsBodyProps {
  tableColumns: ITableColumn<ObjectType>[];
  view: IAnalyticsView<ObjectType>;
  toolbarFilters: IToolbarFilter[];
}

interface AnalyticsColumnBuilderProps extends AnalyticsBodyProps {
  view: IAnalyticsView<ObjectType>;
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
  const [mainData, setMainData] = useState<MainRequestDefinition | null>(null);
  const [options, setOptions] = useState<OptionsDefinition | null>(null);
  const [error, setError] = useState<any>(null);

  const post = usePostRequest();
  const get = useGetRequest();

  async function readData() {
    try {
      const result = (await get(props.main_url, {})) as MainRequestDefinition;
      result.report.layoutProps.dataEndpoint = transformEndpoint(
        result.report.layoutProps.dataEndpoint
      );
      result.report.layoutProps.optionsEndpoint = transformEndpoint(
        result.report.layoutProps.optionsEndpoint
      );

      props.processMainData?.(props, result);
      setMainData(result);

      let optionsPayload = props.defaultOptionsParams || {};
      props.processOptionsRequestPayload?.(props, optionsPayload);

      const result2 = (await post(
        result.report.layoutProps.optionsEndpoint,
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

  const view = useAnalyticsView<ObjectType>({
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
  return (
    <PageTable<ObjectType>
      {...props.view}
      errorStateTitle="some error title"
      emptyStateTitle="empty state title"
      tableColumns={props.tableColumns || []}
      toolbarFilters={props.toolbarFilters}
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

  // add main filter
  const filter: IToolbarSingleSelectFilter = {
    key: main_filter,
    type: ToolbarFilterType.SingleSelect,
    options: computeMainFilterOptions(params),
    placeholder: main_filter,
    query: main_filter,
    label: main_filter,
  };

  if (filter.options.length > 0) {
    filters.push(filter);
  }

  // get secondary filter

  let options2: PageSelectOption<string>[] = [];
  const secondary_filter_name = queryParams.get(main_filter);
  if (secondary_filter_name) {
    const options = params?.options;
    const option = options?.[secondary_filter_name] as { key: string; value: string }[];

    if (option) {
      // build filter from this option
      options2 = option.map((item) => {
        return { key: item.key, value: item.value, label: item.value };
      });
    }
  }

  const filter2: IToolbarSingleSelectFilter = {
    key: secondary_filter,
    type: ToolbarFilterType.SingleSelect,
    options: options2,
    placeholder: secondary_filter,
    query: secondary_filter,
    label: secondary_filter,
  };

  filters.push(filter2);

  return filters;
}

function computeMainFilterOptions(params: AnalyticsBodyProps) {
  const items: PageSelectOption<ObjectType>[] = [];
  const postParams = params.defaultOptionsParams;
  if (!postParams) {
    return items;
  }

  const options = params.options;

  for (const key in postParams) {
    const postParam = postParams[key];
    if (Array.isArray(postParam) && options) {
      // determine if it matches the options
      const found = Object.keys(options).find((item) => item == key);
      if (found) {
        // add it to the dropdown items
        const item: PageSelectOption<ObjectType> = {
          key,
          value: key,
          label: key,
        };

        items.push(item);
      }
    }
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
      column.header = key;
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
        col.header = tableHeader.value;
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

  // another fine tunning done by outside config script
  params.processTableColumns?.(params, columns);

  return columns;
}
