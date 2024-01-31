import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import { ITableColumn, PageTable, TextCell, useGetPageUrl } from '../../../../../framework';
import { pulpAPI } from '../../../common/api/formatPath';
import { useHubView } from '../../../common/useHubView';
import { HubRoute } from '../../../main/HubRoutes';
import { RepositoryVersion } from '../Repository';
import { useVersionsActions } from '../hooks/useRepositoryActions';

export function RepositoryVersions() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string; version: string }>();
  const { repo_id } = useOutletContext<{ repo_id: string }>();
  const rowActions = useVersionsActions();
  const tableColumns = useMemo<ITableColumn<RepositoryVersion>[]>(
    () => [
      {
        header: t('Version number'),
        cell: (repository) => (
          <TextCell
            text={repository?.number?.toString()}
            to={getPageUrl(HubRoute.RepositoryVersionPage, {
              params: { id: params.id, version: repository?.number?.toString() },
            })}
          />
        ),
        sort: 'number',
      },
      {
        header: t('Created date'),
        type: 'datetime',
        value: (repository: RepositoryVersion) => repository.pulp_created,
        sort: 'pulp_created',
      },
    ],
    [t, getPageUrl, params.id]
  );

  const view = useHubView<RepositoryVersion>({
    url: pulpAPI`/repositories/ansible/ansible/${repo_id}/versions/`,
    keyFn: (repo) => repo.number,
    queryParams: {
      offset: '0',
      limit: '10',
    },
    defaultSort: 'pulp_created',
  });

  return (
    <PageTable<RepositoryVersion>
      id="hub-collection-versions-search-table"
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading collection versions')}
      emptyStateTitle={t('No collection versions yet')}
      emptyStateDescription={t('Collection versions will appear once the collection is modified.')}
      emptyStateButtonText={t('Add collection')}
      emptyStateButtonClick={() => {}}
      {...view}
      defaultTableView="list"
      defaultSubtitle={t('Collection')}
    />
  );
}
