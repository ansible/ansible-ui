import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCollectionFilters } from './useCollectionFilters';
import {
  ColumnTableOption,
  ITableColumn,
  MultiSelectDialog,
  TextCell,
  usePageDialog,
} from '../../../../framework';
import { CollectionVersionSearch } from '../Collection';
import { collectionKeyFn, hubAPI } from '../../api/utils';
import { useHubView } from '../../useHubView';

export function CollectionMultiSelectDialog(props: {
  title: string;
  description: string;
  onSelect: (collections: CollectionVersionSearch[]) => void;
}) {
  const { t } = useTranslation();
  const toolbarFilters = useCollectionFilters();
  const tableColumns = useMemo<ITableColumn<CollectionVersionSearch>[]>(
    () => [
      {
        header: t('Name'),
        value: (collection) => collection.collection_version.name,
        cell: (collection) => <TextCell text={collection.collection_version.name} />,
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Description'),
        type: 'description',
        value: (collection) => collection.collection_version.description,
        table: ColumnTableOption.Expanded,
      },
      {
        header: t('Version'),
        type: 'text',
        value: (collection) => collection.collection_version.version,
        table: ColumnTableOption.Hidden,
        sort: 'version',
      },
    ],
    [t]
  );
  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions`,
    keyFn: collectionKeyFn,
    sortKey: 'order_by',
    queryParams: {
      is_deprecated: 'false',
      repository_label: '!hide_from_search',
      is_highest: 'true',
    },
    toolbarFilters,
  });
  return (
    <MultiSelectDialog
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
      defaultSort="name"
      confirmText={t('Select')}
    />
  );
}

export function useSelectCollectionsDialog() {
  const [_, setDialog] = usePageDialog();
  const openSelectCollectionsDialog = useCallback(
    (
      title: string,
      description: string,
      onSelect: (collections: CollectionVersionSearch[]) => void
    ) => {
      setDialog(
        <CollectionMultiSelectDialog title={title} description={description} onSelect={onSelect} />
      );
    },
    [setDialog]
  );
  return openSelectCollectionsDialog;
}
