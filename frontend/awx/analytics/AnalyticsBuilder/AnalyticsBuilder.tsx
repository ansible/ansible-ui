import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useGetRequest } from '../../../common/crud/useGet';
import { useState, useEffect } from 'react';
import { useAnalyticsView, IAnalyticsView } from '../../analytics/useAnalyticsView';
import { PageTable } from '../../../../framework/PageTable/PageTable';
import { ITableColumn, ITableColumnTypeText } from '../../../../framework';

import { ColumnTableOption } from '../../../../framework/PageTable/PageTableColumn';

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

export interface OptionsDefinition {
  sort_options: [{ key: string }];
}

export interface AnalyticsBuilderProps {
  main_url: string;

  // used for processing and adding, or modyfying some data that came from the server and are not complete
  processMainData?: (props: AnalyticsBuilderProps, mainData: MainRequestDefinition) => void;
  processOptions?: (props: AnalyticsBuilderProps, options: OptionsDefinition) => void;

  // default post options params
  defaultOptionsParams?: object;

  // on the fly postprocessing of default params
  processOptionsRequestPayload?: (props: AnalyticsBuilderProps, data: object) => void;

  // default post data params
  defaultDataParams?: object;

  // on the fly postprocessing of default params
  processDataRequestPayload?: (props: AnalyticsBuilderProps, data: object) => void;

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

export type ObjectType = any;

function AnalyticsBody(props: AnalyticsBodyProps) {
  let sortableColumns = getAvailableSortingKeys(props);

  const view = useAnalyticsView<ObjectType>({
    url: props.mainData.report.layoutProps.dataEndpoint,
    keyFn: props.rowKeyFn ? props.rowKeyFn : () => 0,
    builderProps: props,
    sortableColumns,
  });

  const newProps = { ...props, view };

  const columns = buildTableColumns({ ...newProps }) as ITableColumn<ObjectType>[];

  return (
    <>
      Analytics builder - body
      <AnalyticsTable {...newProps} tableColumns={columns}></AnalyticsTable>
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
