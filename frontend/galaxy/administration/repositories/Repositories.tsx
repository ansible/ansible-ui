import { CogIcon, EditIcon, SyncIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  ITableColumn,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  SinceCell,
  TextCell,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { galaxyKeyFn, pulpHRefKeyFn, useGalaxyView } from '../../useGalaxyView';
import { RemoteRepository, Repository } from './Repository';

export function Repositories() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader title={t('Repository management')} />
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
  const view = useGalaxyView<Repository>(
    '/api/automation-hub/_ui/v1/distributions/',
    galaxyKeyFn,
    undefined,
    tableColumns
  );
  return (
    <PageTable<Repository>
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
        cell: (repository) => <SinceCell value={repository.repository.pulp_last_updated} />,
      },
    ],
    []
  );
  return tableColumns;
}

export function RemoteRepositories() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useRemoteRepositoriesColumns();
  const view = useGalaxyView<RemoteRepository>(
    '/api/automation-hub/_ui/v1/remotes/',
    pulpHRefKeyFn,
    undefined,
    tableColumns
  );
  const rowActions = useMemo<IPageAction<RemoteRepository>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: CogIcon,
        label: t('Configure repository'),
        onClick: (repository) =>
          navigate(RouteObj.EditRepository.replace(':id', repository.name.toString())),
      },
      {
        type: PageActionType.single,
        icon: SyncIcon,
        label: t('Sync repository'),
        onClick: (repository) =>
          navigate(RouteObj.EditRepository.replace(':id', repository.name.toString())),
      },
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit repository'),
        onClick: (repository) =>
          navigate(RouteObj.EditRepository.replace(':id', repository.name.toString())),
      },
    ],
    [navigate, t]
  );
  return (
    <PageTable<RemoteRepository>
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
        cell: (repository) => <SinceCell value={repository.last_sync_task.finished_at} />,
      },
      {
        header: t('Last modified'),
        cell: (repository) => <SinceCell value={repository.updated_at} />,
      },
      {
        header: t('Created'),
        cell: (repository) => <SinceCell value={repository.created_at} />,
      },
    ],
    [t]
  );
  return tableColumns;
}
