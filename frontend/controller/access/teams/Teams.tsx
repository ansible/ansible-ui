import { ButtonVariant } from '@patternfly/react-core';
import {
  EditIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  PlusIcon,
  SyncIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActions,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
} from '../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '../../../common/columns';
import { RouteE } from '../../../Routes';
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
  useOrganizationToolbarFilter,
} from '../../common/controller-toolbar-filters';
import { Team } from '../../interfaces/Team';
import { useControllerView } from '../../useControllerView';
import { AccessNav } from '../common/AccessNav';
import { useSelectUsersAddTeams } from '../users/hooks/useSelectUsersAddTeams';
import { useSelectUsersRemoveTeams } from '../users/hooks/useSelectUsersRemoveTeams';
import { useDeleteTeams } from './hooks/useDeleteTeams';

export function Teams() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const toolbarFilters = useTeamsFilters();

  const tableColumns = useTeamsColumns();

  const view = useControllerView<Team>({ url: '/api/v2/teams/', toolbarFilters, tableColumns });

  const deleteTeams = useDeleteTeams(view.unselectItemsAndRefresh);

  const selectUsersAddTeams = useSelectUsersAddTeams();
  const selectUsersRemoveTeams = useSelectUsersRemoveTeams();

  const toolbarActions = useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create team'),
        onClick: () => navigate(RouteE.CreateTeam),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.bulk,
        icon: PlusCircleIcon,
        label: t('Add users to selected teams'),
        onClick: () => selectUsersAddTeams(view.selectedItems),
      },
      {
        type: PageActionType.bulk,
        icon: MinusCircleIcon,
        label: t('Remove users from selected teams'),
        onClick: () => selectUsersRemoveTeams(view.selectedItems),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected teams'),
        onClick: deleteTeams,
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.button,
        icon: SyncIcon,
        label: t('Refresh'),
        onClick: () => void view.refresh(),
      },
    ],
    [deleteTeams, navigate, selectUsersAddTeams, selectUsersRemoveTeams, t, view]
  );

  const rowActions = useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.single,
        // variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit team'),
        onClick: (team) => navigate(RouteE.EditTeam.replace(':id', team.id.toString())),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.single,
        icon: PlusCircleIcon,
        label: t('Add users to team'),
        onClick: (team) => selectUsersAddTeams([team]),
      },
      {
        type: PageActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove users from team'),
        onClick: (team) => selectUsersRemoveTeams([team]),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete team'),
        onClick: (team) => deleteTeams([team]),
      },
    ],
    [deleteTeams, navigate, selectUsersAddTeams, selectUsersRemoveTeams, t]
  );

  const headerActions = useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: SyncIcon,
        label: 'Refresh',
        onClick: () => void view.refresh(),
      },
    ],
    [view]
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Teams')}
        titleHelpTitle={t('Team')}
        titleHelp={t('teams.title.help')}
        titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/teams.html"
        description={t('teams.title.description')}
        navigation={<AccessNav active="teams" />}
        headerActions={<PageActions actions={headerActions} iconOnly collapse="never" />}
      />
      <PageTable
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading teams')}
        emptyStateTitle={t('No teams yet')}
        emptyStateDescription={t('To get started, create a team.')}
        emptyStateButtonText={t('Create team')}
        emptyStateButtonClick={() => navigate(RouteE.CreateTeam)}
        {...view}
        defaultSubtitle={t('Team')}
      />
    </PageLayout>
  );
}

export function useTeamsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const organizationToolbarFilter = useOrganizationToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      organizationToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [nameToolbarFilter, organizationToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  );
  return toolbarFilters;
}

export function useTeamsColumns(options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const { t } = useTranslation();
  const history = useNavigate();
  const nameColumnClick = useCallback(
    (team: Team) => history(RouteE.TeamDetails.replace(':id', team.id.toString())),
    [history]
  );
  const nameColumn = useNameColumn({ header: t('Team'), ...options, onClick: nameColumnClick });
  const descriptionColumn = useDescriptionColumn();
  const organizationColumn = useOrganizationNameColumn(options);
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<Team>[]>(
    () => [nameColumn, descriptionColumn, organizationColumn, createdColumn, modifiedColumn],
    [createdColumn, descriptionColumn, modifiedColumn, nameColumn, organizationColumn]
  );
  return tableColumns;
}
