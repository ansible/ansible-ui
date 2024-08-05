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
import { Repository } from '../Repository';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function RepositoryVersions() {
  const { t } = useTranslation();
  const { repo_id, repository } = useOutletContext<{ repo_id: string; repository: Repository }>();

  const view = useHubView<RepositoryVersion>({
    url: pulpAPI`/repositories/ansible/ansible/${repo_id}/versions/`,
    keyFn: (repo) => repo.number,
    defaultSort: '-number',
  });

  const rowActions = useVersionsActions(
    view.unselectItemsAndRefresh,
    repository.latest_version_href
  );

  const tableColumns = useRepositoryVersionColumns(repository.latest_version_href);

  return (
    <PageTable<RepositoryVersion>
      id="hub-collection-versions-search-table"
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading collection versions')}
      emptyStateTitle={t('No collection versions yet')}
      emptyStateDescription={t('Collection versions will appear once the collection is modified.')}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={t('Add collection')}
      emptyStateButtonClick={() => {}}
      {...view}
      defaultTableView="table"
      defaultSubtitle={t('Collection')}
    />
  );
}

export function useRepositoryVersionColumns(latest_href?: string) {
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string; version: string }>();
  const { t } = useTranslation();

  return useMemo<ITableColumn<RepositoryVersion>[]>(
    () => [
      {
        header: t('Version number'),
        cell: (repository) => (
          <TextCell
            text={
              repository?.number?.toString() +
              (latest_href === repository?.pulp_href ? ' ' + t('(latest)') : '')
            }
            to={getPageUrl(HubRoute.RepositoryVersionPage, {
              params: { id: params.id, version: repository?.number?.toString() },
            })}
          />
        ),
        sort: 'number',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (repository: RepositoryVersion) => repository.pulp_created,
        sort: 'pulp_created',
      },
    ],
    [t, getPageUrl, params.id, latest_href]
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

      const title = t('Revert to repository version.');

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

function useVersionsActions(callback?: (items: RepositoryVersion[]) => void, latest_href?: string) {
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
        isDisabled: (item) =>
          latest_href === item.pulp_href ? t('Already at the highest version') : '',
      },
    ],
    [t, revert, latest_href]
  );

  return actions;
}
