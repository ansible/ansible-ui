import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useGetRequest } from '../../../common/crud/useGet';
import { useState, useEffect } from 'react';
import { useAnalyticsView, IAnalyticsView } from '../../analytics/useAnalyticsView';
import { PageTable } from '../../../../framework/PageTable/PageTable';
import { ITableColumn, ITableColumnTypeText } from '../../../../framework';
import { NavItem } from '@patternfly/react-core';

export interface MainRequestDefinition {
  report: {
    table_headers: [];

    layoutProps: {
      // TODO - fix in API
      dataEndpoint: string;
      optionsEndpoint: string;
    };
  };
}

export interface OptionsDefinition {}

export interface AnalyticsBuilderProps {
  main_url: string;
  // used for processing and adding, or modyfying some data that came from the server and are not complete
  processMainData?: (props: AnalyticsBuilderProps, mainData: MainRequestDefinition) => void;
  processOptions?: (props: AnalyticsBuilderProps, options: OptionsDefinition) => void;

  // default post options params
  defaultOptionsParams?: object;

  // on the fly postprocessing of default params
  processOptionsRequestPayload?: (props: AnalyticsBuilderProps, data: object) => void;

  // default item.id
  rowKeyFn?: (item: ObjectType) => string | number;
}

interface AnalyticsBodyProps extends AnalyticsBuilderProps {
  mainData: MainRequestDefinition;
  options: OptionsDefinition;
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

  const post = usePostRequest();
  const get = useGetRequest();

  async function readData() {
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
  }

  useEffect(() => {
    readData();
  }, []);

  if (mainData && options) {
    return <AnalyticsBody mainData={mainData} options={options} {...props} />;
  }

  return <>Analytics builder - loading</>;
}

export type ObjectType = any;

function AnalyticsBody(props: AnalyticsBodyProps) {
  const analyticsView = useAnalyticsView<ObjectType>({
    url: props.mainData.report.layoutProps.dataEndpoint,
    keyFn: props.rowKeyFn ? props.rowKeyFn : () => 0,
  });

  return (
    <>
      Analytics builder - body
      <AnalyticsTable view={analyticsView} {...props}></AnalyticsTable>
    </>
  );
}

type AnalyticsTableProps = AnalyticsBodyProps & { view: IAnalyticsView<ObjectType> };

function AnalyticsTable(props: AnalyticsTableProps) {
  const columns = buildTableColumns(props) as ITableColumn<ObjectType>[];

  return (
    <PageTable<ObjectType>
      {...props.view}
      errorStateTitle="some error title"
      emptyStateTitle="empty state title"
      tableColumns={columns}
    />
  );
}

function buildTableColumns(params: AnalyticsTableProps) {
  let columns: unknown[] = [];

  if (!params.view?.pageItems || params.view?.pageItems.length == 0) {
    return columns;
  }

  const obj = params.view.pageItems[0];

  // loop over obj items
  for (let key in obj) {
    let column = {} as ITableColumnTypeText<ObjectType>;
    column.type = 'text';
    column.header = key;
    column.value = (item) => item[key] as string;
    columns.push(column);
  }

  return columns;
}
