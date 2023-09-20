import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useGetRequest } from '../../../common/crud/useGet';
import { useState, useEffect } from 'react';
import { useAnalyticsView, IAnalyticsView } from '../../analytics/useAnalyticsView';
import { PageTable } from '../../../../framework/PageTable/PageTable';
import { ITableColumn, ITableColumnTypeText } from '../../../../framework';

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
  processMainData?: (mainData: MainRequestDefinition) => void;
  processOptions?: (options: OptionsDefinition) => void;

  rowKeyFn: (item: ObjectType) => string | number;
}

interface AnalyticsBodyProps extends AnalyticsBuilderProps {
  mainData: MainRequestDefinition;
  options: OptionsDefinition;
}

export function AnalyticsBuilder(props: AnalyticsBuilderProps) {
  const [mainData, setMainData] = useState<MainRequestDefinition | null>(null);
  const [options, setOptions] = useState<OptionsDefinition | null>(null);

  const post = usePostRequest();
  const get = useGetRequest();

  async function readData() {
    const result = (await get(props.main_url, {})) as MainRequestDefinition;
    props.processMainData?.(result);
    setMainData(result);

    const result2 = (await post(
      result.report.layoutProps.optionsEndpoint,
      {}
    )) as OptionsDefinition;
    props.processOptions?.(result2);
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
    keyFn: props.rowKeyFn,
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
