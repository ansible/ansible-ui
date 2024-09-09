import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  MultiSelectDialog,
  PageActionSelection,
  PageActionType,
  PageTable,
  TextCell,
  compareStrings,
  useBulkConfirmation,
  usePageAlertToaster,
  usePageDialog,
} from '../../../../framework';
import { getItemKey, postRequest } from '../../../../frontend/common/crud/Data';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { IPlatformView, usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useTeamColumns } from '../../teams/hooks/useTeamColumns';
import { useTeamFilters } from '../../teams/hooks/useTeamFilters';

export function PlatformUserTeams() {
  const { t } = useTranslation();
  const toolbarFilters = useTeamFilters();
  const tableColumns = useTeamColumns();
  const userId = useParams<{ id: string }>().id || '';

  const view = usePlatformView<PlatformTeam>({
    url: userId && gatewayAPI`/users/${userId}/teams/`,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useUserTeamsToolbarActions(userId, view);
  const rowActions = useUserTeamsRowActions(userId, view);

  return (
    <PageTable
      emptyStateActions={toolbarActions.slice(0, 1)}
      emptyStateButtonText={t('Add teams')}
      emptyStateDescription={t('Add teams by clicking the button below.')}
      emptyStateTitle={t('There are currently no teams added to this user.')}
      errorStateTitle={t('Error loading teams')}
      rowActions={rowActions}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      toolbarFilters={toolbarFilters}
      {...view}
    />
  );
}

function SelectTeams(props: {
  title: string;
  description: string;
  confirmText: string;
  onSelect: (teams: PlatformTeam[]) => Promise<void>;
}) {
  const toolbarFilters = useTeamFilters();
  const tableColumns = useTeamColumns({ disableLinks: true });
  const view = usePlatformView<PlatformTeam>({
    url: gatewayAPI`/teams/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });

  return (
    <MultiSelectDialog
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

function useSelectTeams() {
  const [_, setDialog] = usePageDialog();
  const openSelectTeams = useCallback(
    (
      title: string,
      description: string,
      confirmText: string,
      onSelect: (teams: PlatformTeam[]) => Promise<void>
    ) => {
      setDialog(
        <SelectTeams
          title={title}
          description={description}
          confirmText={confirmText}
          onSelect={onSelect}
        />
      );
    },
    [setDialog]
  );
  return openSelectTeams;
}

function useAssociateUserTeams(userId: string, onComplete: () => Promise<void>) {
  const { t } = useTranslation();
  const selectTeams = useSelectTeams();
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();

  const associateTeams = useCallback(() => {
    selectTeams(
      t('Add teams'),
      t('Select teams below to be added to this user'),
      t('Add teams'),
      async (teams: PlatformTeam[]) => {
        if (!userId) return;
        try {
          await Promise.all(
            teams.map((team) =>
              postRequest(gatewayAPI`/teams/${team.id.toString()}/users/associate/`, {
                instances: [userId],
              })
            )
          );
        } catch (error) {
          alertToaster.addAlert({
            variant: 'danger',
            title: t(`Failed to add team(s) to user.`),
            children: error instanceof Error && error.message,
          });
        }
        await onComplete();
      }
    );
  }, [alertToaster, onComplete, postRequest, selectTeams, t, userId]);
  return associateTeams;
}

function useRemoveUserTeams(userId: string, onComplete: (teams: PlatformTeam[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useTeamColumns({ disableLinks: true });
  const removeActionNameColumn = useMemo(
    () => ({
      header: t('Team name'),
      cell: (team: PlatformTeam) => <TextCell text={team.name} />,
      sort: 'name',
      maxWidth: 200,
    }),
    [t]
  );
  const actionColumns = useMemo(() => [removeActionNameColumn], [removeActionNameColumn]);

  const bulkAction = useBulkConfirmation<PlatformTeam>();
  const removeTeams = (teams: PlatformTeam[]) => {
    bulkAction({
      title: t('Remove teams', { count: teams.length }),
      confirmText: t('Yes, I confirm that I want to remove these {{count}} teams from the user.', {
        count: teams.length,
      }),
      actionButtonText: t('Remove teams', { count: teams.length }),
      items: teams.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns: confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (team: PlatformTeam, signal) =>
        postRequest(
          userId && team?.id ? gatewayAPI`/teams/${team.id.toString()}/users/disassociate/` : '',
          { instances: [userId] },
          signal
        ),
    });
  };
  return removeTeams;
}

function useUserTeamsToolbarActions(userId: string, view: IPlatformView<PlatformTeam>) {
  const { t } = useTranslation();

  const associateTeams = useAssociateUserTeams(userId, view.refresh);
  const removeTeams = useRemoveUserTeams(userId, view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<PlatformTeam>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Add teams'),
        onClick: associateTeams,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove teams'),
        onClick: removeTeams,
        isDanger: true,
      },
    ],
    [t, associateTeams, removeTeams]
  );

  return toolbarActions;
}

function useUserTeamsRowActions(userId: string, view: IPlatformView<PlatformTeam>) {
  const { t } = useTranslation();

  const removeTeams = useRemoveUserTeams(userId, view.unselectItemsAndRefresh);

  const rowActions = useMemo<IPageAction<PlatformTeam>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        isPinned: true,
        label: t('Remove team'),
        onClick: (team) => removeTeams([team]),
        isDanger: true,
      },
    ];
  }, [removeTeams, t]);

  return rowActions;
}
