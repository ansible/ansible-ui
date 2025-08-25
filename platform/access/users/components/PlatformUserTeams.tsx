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
} from '@ansible/ansible-ui-framework';
import { getItemKey } from '@ansible/common-ui/crud/Data';
import { useGet, useGetRequest } from '@ansible/common-ui/crud/useGet';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { IPlatformView, usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useTeamColumns } from '../../teams/hooks/useTeamColumns';
import { useTeamFilters } from '../../teams/hooks/useTeamFilters';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { useDeleteRequest } from '@ansible/common-ui/crud/useDeleteRequest';

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
      emptyStateButtonText={t('Assign teams')}
      emptyStateDescription={t(
        'To get started, assign teams to this user. This user will inherit roles assigned to these teams.'
      )}
      emptyStateTitle={t('No teams')}
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

  const { data: teamMemberRoleData } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayAPI`/role_definitions/`,
    {
      name: 'Team Member',
    }
  );
  const associateTeams = useCallback(() => {
    selectTeams(
      t('Assign teams'),
      t('Select teams below to be assigned to this user'),
      t('Assign teams'),
      async (teams: PlatformTeam[]) => {
        if (!userId) return;
        try {
          await Promise.all(
            teams.map((team) =>
              postRequest(gatewayAPI`/role_user_assignments/`, {
                object_id: team.id,
                role_definition: teamMemberRoleData?.results[0]?.id,
                user: userId,
              })
            )
          );
        } catch (error) {
          alertToaster.addAlert({
            variant: 'danger',
            title: t(`Failed to assign team(s) to user.`),
            children: error instanceof Error && error.message,
          });
        }
        await onComplete();
      }
    );
  }, [alertToaster, onComplete, postRequest, selectTeams, t, teamMemberRoleData?.results, userId]);
  return associateTeams;
}

function useRemoveUserTeams(userId: string, onComplete: (teams: PlatformTeam[]) => void) {
  const { t } = useTranslation();
  const getRequest = useGetRequest<PlatformItemsResponse<UserAssignment>>();
  const deleteRequest = useDeleteRequest();
  const confirmationColumns = useTeamColumns({ disableLinks: true });
  const { data: teamMemberRoleData } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayAPI`/role_definitions/`,
    {
      name: 'Team Member',
    }
  );
  const { data: teamAdminRoleData } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayAPI`/role_definitions/`,
    {
      name: 'Team Admin',
    }
  );
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
      actionFn: async (team: PlatformTeam) => {
        const teamMemberRoleAssignments = await getRequest(gatewayAPI`/role_user_assignments/`, {
          object_id: team?.id ?? '',
          user_id: userId,
          role_definition: `${teamMemberRoleData?.results[0]?.id}`,
        });

        await Promise.all(
          teamMemberRoleAssignments?.results?.map(async (assignment) => {
            await deleteRequest(gatewayAPI`/role_user_assignments/${assignment?.id}/`);
          })
        );
        const teamAdminRoleAssignments = await getRequest(gatewayAPI`/role_user_assignments/`, {
          object_id: team?.id ?? '',
          user_id: userId,
          role_definition: `${teamAdminRoleData?.results[0]?.id}`,
        });

        await Promise.all(
          teamAdminRoleAssignments?.results?.map(async (assignment) => {
            await deleteRequest(gatewayAPI`/role_user_assignments/${assignment?.id}/`);
          })
        );
      },
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
        label: t('Assign teams'),
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
