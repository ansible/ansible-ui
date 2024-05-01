import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import {
  IPageAction,
  MultiSelectDialog,
  PageActionSelection,
  PageActionType,
  PageTable,
  TextCell,
  compareStrings,
  useBulkConfirmation,
  usePageDialog,
} from '../../../../framework';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { getItemKey, postRequest } from '../../../../frontend/common/crud/Data';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { IPlatformView, usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { useTeamFilters } from '../../teams/hooks/useTeamFilters';
import { useTeamColumns } from '../../teams/hooks/useTeamColumns';

export function PlatformUserTeams() {
  const { t } = useTranslation();
  const toolbarFilters = useTeamFilters();
  const tableColumns = useTeamColumns();
  const userId = useParams<{ id: string }>().id || '';

  const view = usePlatformView<PlatformTeam>({
    url: userId && gatewayV1API`/users/${userId}/teams/`,
    toolbarFilters,
    tableColumns,
  });

  const { canAssociateTeam } = useUserTeamsPermissions(userId);
  const toolbarActions = useUserTeamsToolbarActions(userId, view);
  const rowActions = useUserTeamsRowActions(userId, view);

  return (
    <PageTable
      emptyStateActions={canAssociateTeam ? toolbarActions.slice(0, 1) : undefined}
      emptyStateButtonText={canAssociateTeam ? t('Add teams') : undefined}
      emptyStateDescription={
        canAssociateTeam
          ? t('Add teams by clicking the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canAssociateTeam ? undefined : CubesIcon}
      emptyStateTitle={
        canAssociateTeam
          ? t('There are currently no teams added to this user.')
          : t('You do not have permission to add a team to this user.')
      }
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
    url: gatewayV1API`/teams/`,
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

  const associateTeams = useCallback(() => {
    selectTeams(
      t('Add teams'),
      t('Select teams below to be added to this user'),
      t('Save'),
      async (teams: PlatformTeam[]) => {
        if (!userId) return;
        await Promise.all(
          teams.map((team) =>
            // FIXME: users/*/teams
            postRequest(gatewayV1API`/teams/${team.id.toString()}/users/associate/`, {
              instances: [userId],
            })
          )
        );
        await onComplete();
      }
    );
  }, [onComplete, postRequest, selectTeams, t, userId]);
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
          // FIXME: users/*/teams
          userId && team?.id ? gatewayV1API`/teams/${team.id.toString()}/users/disassociate/` : '',
          { instances: [userId] },
          signal
        ),
    });
  };
  return removeTeams;
}

function useUserTeamsPermissions(_userId: string) {
  // FIXME: waiting for APIs...
  return { canAssociateTeam: true, canRemoveTeam: true };
}

function useUserTeamsToolbarActions(userId: string, view: IPlatformView<PlatformTeam>) {
  const { t } = useTranslation();
  const { canAssociateTeam, canRemoveTeam } = useUserTeamsPermissions(userId);

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
        label: t('Add team(s)'),
        isDisabled: canAssociateTeam
          ? undefined
          : t(
              'You do not have permission to add teams to this user. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: associateTeams,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Remove selected teams'),
        isDisabled: canRemoveTeam
          ? undefined
          : t(
              'You do not have permission to remove teams from this user. Please contact your system administrator if there is an issue with your access.'
            ),
        onClick: removeTeams,
        isDanger: true,
      },
    ],
    [t, canAssociateTeam, canRemoveTeam, removeTeams, associateTeams]
  );

  return toolbarActions;
}

function useUserTeamsRowActions(userId: string, view: IPlatformView<PlatformTeam>) {
  const { t } = useTranslation();
  const { canRemoveTeam } = useUserTeamsPermissions(userId);

  const removeTeams = useRemoveUserTeams(userId, view.unselectItemsAndRefresh);

  const rowActions = useMemo<IPageAction<PlatformTeam>[]>(() => {
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Remove team'),
        isDisabled: canRemoveTeam
          ? ''
          : t(`The team cannot be removed due to insufficient permissions.`),
        onClick: (team) => removeTeams([team]),
        isDanger: true,
      },
    ];
  }, [canRemoveTeam, removeTeams, t]);

  return rowActions;
}
