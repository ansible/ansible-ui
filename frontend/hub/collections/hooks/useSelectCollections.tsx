import {
  ColumnTableOption,
  ITableColumn,
  MultiSelectDialog,
  TextCell,
  usePageDialog,
} from '@ansible/ansible-ui-framework';
import { Label, Truncate } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { hubAPI } from '../../common/api/formatPath';
import { collectionKeyFn } from '../../common/api/hub-api-utils';
import { getCollectionBadge } from '../../common/collectionBadgeUtils';
import { useHubView } from '../../common/useHubView';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionFilters } from './useCollectionFilters';

function CollectionRepositoryCell(props: Readonly<{ collection: CollectionVersionSearch }>) {
  const { t } = useTranslation();
  const badge = getCollectionBadge(props.collection.repository?.name, t);
  return (
    <Label color={badge.color} icon={badge.icon} variant={badge.variant}>
      <Truncate content={badge.label} style={{ minWidth: 0 }} />
    </Label>
  );
}

export function CollectionMultiSelectDialog(props: {
  title: string;
  description: string;
  onSelect: (collections: CollectionVersionSearch[]) => Promise<unknown>;
  defaultSelection: CollectionVersionSearch[];
  maxSelections?: number;
  allowZeroSelections?: boolean;
}) {
  const { t } = useTranslation();
  const toolbarFilters = useCollectionFilters();
  const tableColumns = useMemo<ITableColumn<CollectionVersionSearch>[]>(
    () => [
      {
        header: t('Name'),
        value: (collection) => collection.collection_version?.name,
        cell: (collection) => <TextCell text={collection.collection_version?.name} />,
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Description'),
        type: 'description',
        value: (collection) => collection.collection_version?.description,
        table: ColumnTableOption.expanded,
      },
      {
        header: t('Version'),
        type: 'text',
        value: (collection) => collection.collection_version?.version,
        table: ColumnTableOption.hidden,
        sort: 'version',
      },
      {
        header: t('Repository'),
        cell: (collection: CollectionVersionSearch) => (
          <CollectionRepositoryCell collection={collection} />
        ),
      },
    ],
    [t]
  );
  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions/`,
    keyFn: collectionKeyFn,
    queryParams: {
      is_deprecated: 'false',
      repository_label: '!hide_from_search',
      is_highest: 'true',
    },
    toolbarFilters,
    defaultSelection: props.defaultSelection,
    defaultSort: 'name',
  });
  return (
    <MultiSelectDialog
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
      confirmText={t('Select')}
      maxSelections={props.maxSelections}
      allowZeroSelections={props.allowZeroSelections}
    />
  );
}

export function useSelectCollectionsDialog(defaultSelection: CollectionVersionSearch[]) {
  const [_, setDialog] = usePageDialog();
  const openSelectCollectionsDialog = useCallback(
    (
      title: string,
      description: string,
      onSelect: (collections: CollectionVersionSearch[]) => Promise<unknown>,
      options?: {
        maxSelections?: number;
        allowZeroSelections?: boolean;
      }
    ) => {
      setDialog(
        <CollectionMultiSelectDialog
          title={title}
          description={description}
          onSelect={onSelect}
          defaultSelection={defaultSelection}
          maxSelections={options?.maxSelections}
          allowZeroSelections={options?.allowZeroSelections}
        />
      );
    },
    [defaultSelection, setDialog]
  );
  return openSelectCollectionsDialog;
}
