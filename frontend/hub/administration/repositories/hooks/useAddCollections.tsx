import { Modal } from '@patternfly/react-core';
import { usePageDialogs } from '../../../../../framework';
import { CollectionVersionSearch } from '../../../collections/Collection';
import { hubAPI } from '../../../common/api/formatPath';
import { collectionKeyFn } from '../../../common/api/hub-api-utils';
import { useHubView } from '../../../common/useHubView';
import { AnsibleAnsibleRepositoryResponse as AnsibleRepository } from '../../../interfaces/generated/AnsibleAnsibleRepositoryResponse';
import { Repository } from '../Repository';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import { useSelectRepositorySingle } from './useRepositorySelector';

import { ReactNode } from 'react';
import { ITableColumn, PageTable, useGetPageUrl } from '../../../../../framework';
import { singleSelectBrowseAdapter } from '../../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSingleSelectFilter';
import { collectionId } from '../RepositoryPage/RepositoryCollectionVersion';
import { useRepoQueryOptions } from './useRepoQueryOptions';

import { AnsibleTowerIcon } from '@patternfly/react-icons';

import { TextCell } from '../../../../../framework';

import { Button } from '@patternfly/react-core';
import { useURLSearchParams } from '../../../../../framework/components/useURLSearchParams';
import { HubRoute } from '../../../main/HubRoutes';

import { postRequest, requestGet } from '../../../../common/crud/Data';
import { HubError } from '../../../common/HubError';
import { pulpAPI } from '../../../common/api/formatPath';
import { parsePulpIDFromURL, waitForTask } from '../../../common/api/hub-api-utils';
import { PulpItemsResponse } from '../../../common/useHubView';

export function useAddCollections(repository: Repository, refresh: () => void) {
  const { pushDialog, popDialog } = usePageDialogs();

  return () => {
    pushDialog(
      <AddCollectionToRepositoryModal
        repository={repository}
        multiDialogs={{ pushDialog, popDialog }}
        refresh={refresh}
      />
    );
  };
}

function AddCollectionToRepositoryModal(props: {
  repository: Repository;
  multiDialogs: MultiDialogs;
  refresh: () => void;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  async function addCollectionsToRepository(collections: CollectionVersionSearch[]) {
    let operationOk = true;

    try {
      setIsLoading(true);
      setError('');
      const repository = props.repository;
      // load the repository again, because we need the latest version as much actual as possible
      // the one received from the page can be very obsolete, because when someones modify repo in meantime user clicks this action, it will fail
      const actualRepositoryResults = await requestGet<PulpItemsResponse<Repository>>(
        pulpAPI`/repositories/ansible/ansible/?name=${repository.name}`
      );

      const actualRepository = actualRepositoryResults.results[0];

      let itemsToDAdd: string[] = collections
        .filter((col) => col.collection_version?.pulp_href)
        .map((coll) => coll.collection_version?.pulp_href || '');

      // get unique items
      itemsToDAdd = [...new Set(itemsToDAdd)];

      const res: { task: string } = await postRequest(
        pulpAPI`/repositories/ansible/ansible/${
          parsePulpIDFromURL(actualRepository.pulp_href) || ''
        }/modify/`,
        {
          add_content_units: itemsToDAdd,
          base_version: actualRepository.latest_version_href,
        }
      );

      if (res?.task) {
        await waitForTask(parsePulpIDFromURL(res.task));
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      if (err) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        setError(err.toString());
      }
      operationOk = false;
    }

    return operationOk;
  }

  return (
    <Modal
      aria-label={t(`Add collections versions to repository`)}
      onClose={props.multiDialogs.popDialog}
      isOpen
      variant={'large'}
      title={t('Add collections versions to repository')}
      actions={[
        <Button
          key="select"
          variant="primary"
          id="select"
          onClick={() => {
            void (async () => {
              const ok = await addCollectionsToRepository(selectedCollections);
              if (ok) {
                props.multiDialogs.popDialog();
                props.refresh();
              }
            })();
          }}
          isDisabled={selectedCollections.length === 0}
          isLoading={isLoading}
        >
          {t('Select')}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={() => {
            props.multiDialogs.popDialog();
          }}
        >
          {t('Cancel')}
        </Button>,
      ]}
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
      {error ? (
        <HubError
          error={{ name: '', message: t('Can not add collections to repository. ') + error }}
        />
      ) : (
        <></>
      )}
    </Modal>
  );
}

function useRepositoryCollectionVersionFiltersAdd(multiDialogs: MultiDialogs) {
  const { t } = useTranslation();

  const repoQueryOptions = useRepoQueryOptions();
  const selectRepositorySingle = useSelectRepositorySingle(multiDialogs);

  const [, setSearchParams] = useURLSearchParams();
  const params = new URLSearchParams();

  const repoSelector = singleSelectBrowseAdapter<AnsibleRepository>(
    selectRepositorySingle.openBrowse,
    (item) => item.name,
    (name) => {
      return { name };
    },
    (item) => {
      params.set('repository', item.name);
      setSearchParams(params);
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
        queryLabel: (value) => value,
        placeholder: t('Select repositories'),
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

export type MultiDialogs = {
  pushDialog: (_dialog: ReactNode) => void;
  popDialog: () => void;
};
