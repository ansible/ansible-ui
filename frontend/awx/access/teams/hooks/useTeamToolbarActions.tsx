import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, PlusIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Team } from '../../../interfaces/Team';
import { IAwxView } from '../../../useAwxView';
import { useSelectUsersAddTeams } from '../../users/hooks/useSelectUsersAddTeams';
// import { useSelectUsersRemoveTeams } from '../../users/hooks/useSelectUsersRemoveTeams';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { useDeleteTeams } from './useDeleteTeams';

export function useTeamToolbarActions(view: IAwxView<Team>) {
  const { t } = useTranslation();
  const deleteTeams = useDeleteTeams(view.unselectItemsAndRefresh);
  const selectUsersAddTeams = useSelectUsersAddTeams();
  // const selectUsersRemoveTeams = useSelectUsersRemoveTeams();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/v2/teams/');
  const canCreateTeam = Boolean(data && data.actions && data.actions['POST']);

  return useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create team'),
        isDisabled: canCreateTeam
          ? undefined
          : t(
              'You do not have permission to create a team. Please contact your Organization Administrator if there is an issue with your access.'
            ),
        href: RouteObj.CreateTeam,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Bulk,
        icon: PlusCircleIcon,
        label: t('Add users to selected teams'),
        onClick: () => selectUsersAddTeams(view.selectedItems),
      },
      /**
       * TODO: This feature is being hidden for the time being as it is not implemented accurately
       * at the moment. It is also not a feature in the awx UI.
       * With each team having its own access_list of users, we will need to design an experience
       * and implementation to handle removal of users from multiple teams.
       */
      // {
      //   type: PageActionType.bulk,
      //   icon: MinusCircleIcon,
      //   label: t('Remove users from selected teams'),
      //   onClick: () => selectUsersRemoveTeams(view.selectedItems), // This hook has been repurposed as useSelectAndRemoveUsersFromTeam to handle removing users from a single team
      // },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Bulk,
        icon: TrashIcon,
        label: t('Delete selected teams'),
        onClick: deleteTeams,
        isDanger: true,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        icon: SyncIcon,
        label: t('Refresh'),
        onClick: () => void view.refresh(),
      },
    ],
    [canCreateTeam, deleteTeams, selectUsersAddTeams, t, view]
  );
}
