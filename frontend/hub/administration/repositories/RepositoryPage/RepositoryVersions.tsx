import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import { ITableColumn, PageTable, TextCell, useGetPageUrl } from '../../../../../framework';
import { pulpAPI } from '../../../common/api/formatPath';
import { useHubView } from '../../../common/useHubView';
import { HubRoute } from '../../../main/HubRoutes';
import { RepositoryVersion } from '../Repository';
import { useHubBulkConfirmation } from '../../../common/useHubBulkConfirmation';
import { useCallback } from 'react';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { PageActionSelection } from '../../../../../framework';
import { PageActionType } from '../../../../../framework';
import { IPageAction } from '../../../../../framework';
import { waitForTask } from '../../../common/api/hub-api-utils';
import { postRequest } from '../../../../common/crud/Data';

export function RepositoryVersions() {
  const { t } = useTranslation();
  const { repo_id } = useOutletContext<{ repo_id: string }>();

  const view = useHubView<RepositoryVersion>({
    url: pulpAPI`/repositories/ansible/ansible/${repo_id}/versions/`,
    keyFn: (repo) => repo.number,
    queryParams: {
      offset: '0',
      limit: '10',
    },
    defaultSort: '-number',
  });

  const rowActions = useVersionsActions(view.unselectItemsAndRefresh);

  const tableColumns = useRepositoryVersionColumns();

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

export function useRepositoryVersionColumns() {
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string; version: string }>();
  const { t } = useTranslation();

  return useMemo<ITableColumn<RepositoryVersion>[]>(
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
}


export function useRevertToVersion(onComplete?: (items: RepositoryVersion[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useRepositoryVersionColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useHubBulkConfirmation<RepositoryVersion>();

  return useCallback(
    (items: RepositoryVersion[]) => {
      const confirmText = t('Yes, I confirm that I want to revert to this repository version.');

      const title = t('Rever to repository version.');

      const actionButtonText = t('Revert to repository version');
      bulkAction({
        title,
        confirmText,
        actionButtonText,
        items: items,
        keyFn: (item) => item.number,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (item: RepositoryVersion) => {
          return revertToVersion(item);
        },
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

async function revertToVersion(repositoryVersion: RepositoryVersion) {
  const res: { task: string } = await postRequest(
    pulpAPI`/repositories/ansible/ansible/${
      parsePulpIDFromURL(repositoryVersion.repository) || ''
    }/modify/`,
    {
      base_version: repositoryVersion.pulp_href,
    }
  );

  return await waitForTask(parsePulpIDFromURL(res.task));
}

function useVersionsActions(callback?: (items: RepositoryVersion[]) => void) {
  const { t } = useTranslation();
  const revert = useRevertToVersion(callback);

  const actions = useMemo<IPageAction<RepositoryVersion>[]>(
    () => [
      {
        label: t('Revert to this version'),
        onClick: (item) => {
          revert([item]);
        },
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
      },
    ],
    [t, revert]
  );

  return actions;
}
