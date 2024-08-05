import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import { ITableColumn, PageTable, TextCell, useGetPageUrl } from '../../../../../framework';
import { CollectionReduced } from '../../../collections/Collection';
import { pulpAPI } from '../../../common/api/formatPath';
import { useHubView } from '../../../common/useHubView';
import { HubRoute } from '../../../main/HubRoutes';
import { Repository } from '../Repository';

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
            to={getPageUrl(HubRoute.CollectionDetails, {
              params: {
                name: collection.name,
                namespace: collection.namespace,
                repository: repository.name,
              },
              query: { version: collection.version },
            })}
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

  const view = useHubView<CollectionReduced>({
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
      emptyStateDescription={t('There is no collections for this repository.')}
      {...view}
      defaultTableView="list"
      defaultSubtitle={t('Collection')}
    />
  );
}
