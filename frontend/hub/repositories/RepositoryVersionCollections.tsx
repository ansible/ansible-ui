import { pulpAPI } from '../api/formatPath';
import { Repository } from './Repository';
import { useParams, useOutletContext } from 'react-router-dom';
import { ITableColumn, useGetPageUrl, PageTable, TextCell } from '../../../framework';
import { CollectionReduced } from '../collections/Collection';
import { useMemo } from 'react';
import { usePulpView } from '../usePulpView';
import { useTranslation } from 'react-i18next';
import { HubRoute } from '../HubRoutes';

export function RepositoryVersionCollections() {
  const { repository } = useOutletContext<{ repository: Repository }>();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ version: string }>();
  const { t } = useTranslation();

  const tableColumns = useMemo<ITableColumn<CollectionReduced>[]>(
    () => [
      {
        header: t('Collection'),
        cell: (collection) => (
          <TextCell
            text={`${collection.namespace}.${collection.name} v${collection.version}`}
            to={`${getPageUrl(HubRoute.CollectionPage)}?name=${collection.name}&namespace=${
              collection.namespace
            }&repository=${repository.name}&version=${collection.version}`}
          />
        ),
      },
      {
        header: t('Description'),
        type: 'text',
        value: (collection: CollectionReduced) => collection.description,
      },
    ],
    [t, getPageUrl, repository.name]
  );

  const view = usePulpView<CollectionReduced>({
    url: pulpAPI`/content/ansible/collection_versions/?repository_version=${
      repository.versions_href
    }${params.version || ''}/`,
    keyFn: (collection) => collection.name,
    queryParams: {
      offset: '0',
      limit: '10',
    },
    defaultSort: 'pulp_created',
  });
  return (
    <PageTable<CollectionReduced>
      id="hub-collection-versions-search-table"
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading collections')}
      emptyStateTitle={t('No collections yet')}
      emptyStateDescription={t('Collections will appear one day.')}
      {...view}
      defaultTableView="list"
      defaultSubtitle={t('Collection')}
    />
  );
}
