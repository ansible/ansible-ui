import { AnsibleAnsibleRepositoryResponse as AnsibleRepository } from '../../../interfaces/generated/AnsibleAnsibleRepositoryResponse';
import { Repository } from '../Repository';
import { Modal } from '@patternfly/react-core';
import { usePageDialogs } from '../../../../../framework';
import { useHubView } from '../../../common/useHubView';
import { CollectionVersionSearch } from '../../../collections/Collection';
import { hubAPI } from '../../../common/api/formatPath';
import { collectionKeyFn } from '../../../common/api/hub-api-utils';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import { useState } from 'react';
import { useSelectRepositorySingle } from './useRepositorySelector';

import { useRepoQueryOptions } from './useRepoQueryOptions';
import { singleSelectBrowseAdapter } from '../../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSingleSelectFilter';
import { PageTable } from '../../../../../framework';
import { collectionId } from '../RepositoryPage/RepositoryCollectionVersion';
import { ReactNode } from 'react';
import { useGetPageUrl } from '../../../../../framework';
import { ITableColumn } from '../../../../../framework';

import { AnsibleTowerIcon } from '@patternfly/react-icons';

import { TextCell } from '../../../../../framework';

import { HubRoute } from '../../../main/HubRoutes';
import { useSearchParams } from '../../../../../framework/components/useSearchParams';


export function useAddCollections(repository: Repository) {
  const { pushDialog, popDialog } = usePageDialogs();

  return () => {
    pushDialog(
      <AddCollectionToRepositoryModal
        repository={repository}
        multiDialogs={ {pushDialog, popDialog} }
      />
    );
  };
}

function AddCollectionToRepositoryModal(props: {
  repository: Repository;
  multiDialogs : MultiDialogs;
  
}): ReactNode {
  const { t } = useTranslation();
  const toolbarFilters = useRepositoryCollectionVersionFiltersAdd(props.multiDialogs);
  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions/`,
    keyFn: collectionKeyFn,
    defaultSort: 'name',
    queryParams: {
      is_deprecated: 'false',
    },
    toolbarFilters,
  });

  const [selectedCollections, setSelectedCollections] = useState<CollectionVersionSearch[]>([]);
  const tableColumns = useCollectionColumns();

  return (
    <Modal
      onClose={props.multiDialogs.popDialog}
      isOpen
      variant={'large'}
      title={t('Add collections version to repository')}
    >
      <PageTable<CollectionVersionSearch>
        disableListView={true}
        disableCardView={true}
        id="hub-collection-versions-search-table"
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        errorStateTitle={t('Error loading collection versions')}
        emptyStateTitle={t('No collection versions yet')}
        emptyStateDescription={t(
          'Collection versions will appear once the repository is modified.'
        )}
        {...view}
        defaultTableView="table"
        defaultSubtitle={t('Collection')}
        compact={true}
        showSelect={true}
        selectedItems={selectedCollections}
        isSelectMultiple={true}
        isSelected={(item) =>
          selectedCollections.find((i) => collectionId(i) === collectionId(item)) ? true : false
        }
        selectItem={(item) => {
          const newItems = [...selectedCollections, item];
          setSelectedCollections(newItems);
        }}
        selectItems={(items) => {
          const newItems = [...selectedCollections, ...items];
          setSelectedCollections(newItems);
        }}
        unselectItem={(item) => {
          setSelectedCollections(
            selectedCollections.filter((item2) => collectionId(item2) !== collectionId(item))
          );
        }}
        unselectAll={() => {
          setSelectedCollections([]);
        }}
      />
    </Modal>
  );
}

function useRepositoryCollectionVersionFiltersAdd(multiDialogs : MultiDialogs) {
  const { t } = useTranslation();

  const repoQueryOptions = useRepoQueryOptions();
  const selectRepositorySingle = useSelectRepositorySingle(multiDialogs);

  const [searchParams, setSearchParams] = useSearchParams();
  const params = new URLSearchParams();

  const repoSelector = singleSelectBrowseAdapter<AnsibleRepository>(
    selectRepositorySingle.openBrowse,
    (item) => { params.set('repository', item.name);  setSearchParams(params); return item.name},
    (name) => {
      return { name };
    }
  );

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'keywords',
        label: t('Keywords'),
        type: ToolbarFilterType.SingleText,
        query: 'keywords',
        comparison: 'equals',
      },
      {
        key: 'namespace',
        label: t('Namespace'),
        type: ToolbarFilterType.SingleText,
        query: 'namespace',
        comparison: 'equals',
      },
      {
        key: 'repository',
        label: t('Repository'),
        type: ToolbarFilterType.AsyncSingleSelect,
        query: 'repository_name',
        queryOptions: repoQueryOptions,
        openBrowse: repoSelector,
      },
    ],
    [t, repoSelector, repoQueryOptions]
  );
}

export function useCollectionColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  return useMemo<ITableColumn<CollectionVersionSearch>[]>(
    () => [
      {
        header: t('Name'),
        value: (collection) => collection.collection_version?.name,
        cell: (collection) => (
          <TextCell
            text={collection.collection_version?.name}
            to={getPageUrl(HubRoute.CollectionPage, {
              params: {
                name: collection.collection_version?.name,
                namespace: collection.collection_version?.namespace,
                repository: collection.repository?.name,
              },
            })}
          />
        ),
        card: 'name',
        list: 'name',
        icon: () => <AnsibleTowerIcon />,
        sort: 'name',
      },
      {
        header: t('Provided by'),
        type: 'text',
        value: (collection) =>
          t(`Provided by {{namespace}}`, { namespace: collection.collection_version?.namespace }),
        card: 'subtitle',
        list: 'subtitle',
        table: 'hidden',
      },
      {
        header: t('Repository'),
        value: (collection) => collection.repository?.name,
        cell: (collection) => (
          <TextCell
            text={collection.repository?.name}
            to={getPageUrl(HubRoute.RepositoryDetails, {
              params: {
                id: collection.repository?.name,
              },
            })}
          />
        ),
      },
      {
        header: t('Namespace'),
        value: (collection) => collection.collection_version?.namespace,
        sort: 'namespace',
        cell: (collection) => (
          <TextCell
            text={collection.collection_version?.namespace}
            to={getPageUrl(HubRoute.NamespaceDetails, {
              params: {
                id: collection.collection_version?.namespace,
              },
            })}
          />
        ),
      },
      {
        header: t('Description'),
        type: 'description',
        value: (collection) => collection.collection_version?.description,
        card: 'description',
        list: 'description',
      },

      {
        header: t('Updated'),
        type: 'datetime',
        value: (collection) => collection.collection_version?.pulp_created,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Version'),
        type: 'text',
        value: (collection) => collection.collection_version?.version,
        card: 'hidden',
        list: 'secondary',
        sort: 'version',
      },
    ],
    [getPageUrl, t]
  );
}

export type MultiDialogs =
{
    pushDialog: (_dialog: ReactNode) => void;
    popDialog: () => void;
}
