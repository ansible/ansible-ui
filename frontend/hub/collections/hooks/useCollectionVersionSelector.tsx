import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, IToolbarFilter, TextCell, ToolbarFilterType } from '../../../../framework';
import { CollectionVersionSearch } from '../Collection';

import {
  AsyncSelectFilterBuilderProps,
  useAsyncMultiSelectFilterBuilder,
  useAsyncSingleSelectFilterBuilder,
} from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSelectFilterBuilder';
import { hubAPI } from '../../common/api/formatPath';
import { useHubView } from '../../common/useHubView';

type collectionVersionSelectorParams = {
  namespace: string;
  repository: string;
  collection: string;
};
function useParameters(
  params: collectionVersionSelectorParams
): AsyncSelectFilterBuilderProps<CollectionVersionSearch> {
  const tableColumns = useCollectionVersionColumns();
  const toolbarFilters = useCollectionVersionFilters();
  const { t } = useTranslation();

  return {
    title: t`Select Collection Version`,
    tableColumns,
    toolbarFilters,
    useView: useHubView,
    viewParams: {
      url: hubAPI`/v3/plugin/ansible/search/collection-versions/`,
      toolbarFilters,
      tableColumns,
      disableQueryString: true,
      queryParams: {
        name: params.collection,
        namespace: params.namespace,
        repository_name: params.repository,
      },
      keyFn: (item) => {
        return item?.collection_version?.version || '';
      },
    },
  };
}

export function useSelectCollectionVersionMulti(params: collectionVersionSelectorParams) {
  const params2 = useParameters(params);

  return useAsyncMultiSelectFilterBuilder<CollectionVersionSearch>(params2);
}

export function useSelectCollectionVersionSingle(params: collectionVersionSelectorParams) {
  const params2 = useParameters(params);

  return useAsyncSingleSelectFilterBuilder<CollectionVersionSearch>(params2);
}

export function useCollectionVersionColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  return useMemo<ITableColumn<CollectionVersionSearch>[]>(
    () => [
      {
        header: t('Version'),
        value: (item) => item.collection_version?.version,
        cell: (item) => <TextCell text={item.collection_version?.version} />,
      },

      {
        header: t('Description'),
        type: 'description',
        value: (item) => item.collection_version?.description,
      },
    ],
    [t]
  );
}

export function useCollectionVersionFilters() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'keywords',
        label: t('version'),
        type: ToolbarFilterType.SingleText,
        query: 'version',
        comparison: 'equals',
      },
    ],
    [t]
  );
}
