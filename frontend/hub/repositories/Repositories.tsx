import { CogIcon, EditIcon, SyncIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DateTimeCell,
  IPageAction,
  ITableColumn,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  TextCell,
  usePageNavigate,
} from '../../../framework';
import { HubRoute } from '../HubRoutes';
import { hubAPI, pulpHrefKeyFn, pulpIdKeyFn } from '../api/utils';
import { useHubView } from '../useHubView';
import { RemoteRepository, Repository } from './Repository';

export function Repositories() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('Repository Management')}
        description={t(
          'Repositories are online storage locations where Ansible content, such as roles and collections, can be published, shared, and accessed by the community.'
        )}
      />
      <PageTabs>
        <PageTab label={t('Local')}>
          <LocalRepositories />
        </PageTab>
        <PageTab label={t('Remote')}>
          <RemoteRepositories />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}

export function LocalRepositories() {
  const { t } = useTranslation();
  // const navigate = useNavigate()
  const tableColumns = useLocalRepositoriesColumns();
  const view = useHubView<Repository>({
    url: hubAPI`/_ui/v1/distributions/`,
    keyFn: pulpIdKeyFn,
    tableColumns,
  });
  return (
    <PageTable<Repository>
      id="hub-repositories-table"
      // toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading repositories')}
      emptyStateTitle={t('No repositories yet')}
      // emptyStateDescription={t('To get started, create an repository.')}
      // emptyStateButtonText={t('Add repository')}
      // emptyStateButtonClick={() => navigate(RouteObj.CreateRepository)}
      {...view}
    />
  );
}

export function useLocalRepositoriesColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const tableColumns = useMemo<ITableColumn<Repository>[]>(
    () => [
      { header: 'Name', cell: (repository) => <TextCell text={repository.name} /> },
      {
        header: 'Repository',
        cell: (repository) => <TextCell text={repository.repository.name} />,
      },
      {
        header: 'Description',
        cell: (repository) => <TextCell text={repository.repository.description} />,
      },
      {
        header: 'Collections',
        cell: (repository) => <TextCell text={repository.repository.content_count.toString()} />,
      },
      {
        header: 'Modified',
        cell: (repository) => (
          <DateTimeCell format="since" value={repository.repository.pulp_last_updated} />
        ),
      },
    ],
    []
  );
  return tableColumns;
}

export function RemoteRepositories() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const tableColumns = useRemoteRepositoriesColumns();
  const view = useHubView<RemoteRepository>({
    url: hubAPI`/_ui/v1/remotes/`,
    keyFn: pulpHrefKeyFn,
    tableColumns,
  });
  const rowActions = useMemo<IPageAction<RemoteRepository>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CogIcon,
        label: t('Configure repository'),
        onClick: (repository) =>
          pageNavigate(HubRoute.EditRemote, { params: { id: repository.name } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: SyncIcon,
        label: t('Sync repository'),
        onClick: (repository) =>
          pageNavigate(HubRoute.EditRemote, { params: { id: repository.name } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit repository'),
        onClick: (repository) =>
          pageNavigate(HubRoute.EditRemote, { params: { id: repository.name } }),
      },
    ],
    [pageNavigate, t]
  );
  return (
    <PageTable<RemoteRepository>
      id="hub-remote-repositories-table"
      rowActions={rowActions}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading repositories')}
      emptyStateTitle={t('No repositories yet')}
      // emptyStateDescription={t('To get started, create an repository.')}
      // emptyStateButtonText={t('Add repository')}
      // emptyStateButtonClick={() => navigate(RouteObj.CreateRepository)}
      {...view}
    />
  );
}

export function useRemoteRepositoriesColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<RemoteRepository>[]>(
    () => [
      { header: t('Name'), cell: (repository) => <TextCell text={repository.name} /> },
      {
        header: t('Sync status'),
        cell: (repository) => <TextCell text={repository.last_sync_task.state} />,
      },
      {
        header: t('Last sync'),
        cell: (repository) => (
          <DateTimeCell format="since" value={repository.last_sync_task.finished_at} />
        ),
      },
      {
        header: t('Last modified'),
        cell: (repository) => <DateTimeCell format="since" value={repository.updated_at} />,
      },
      {
        header: t('Created'),
        cell: (repository) => <DateTimeCell format="since" value={repository.created_at} />,
      },
    ],
    [t]
  );
  return tableColumns;
}
