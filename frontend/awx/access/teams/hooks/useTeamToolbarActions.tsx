import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, PlusIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { AwxRoute } from '../../../AwxRoutes';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Team } from '../../../interfaces/Team';
import { IAwxView } from '../../../useAwxView';
import { useSelectUsersAddTeams } from '../../users/hooks/useSelectUsersAddTeams';
import { useDeleteTeams } from './useDeleteTeams';
import { awxAPI } from '../../../api/awx-utils';

export function useTeamToolbarActions(view: IAwxView<Team>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const deleteTeams = useDeleteTeams(view.unselectItemsAndRefresh);
  const selectUsersAddTeams = useSelectUsersAddTeams();
  // const selectUsersRemoveTeams = useSelectUsersRemoveTeams();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/teams/`);
  const canCreateTeam = Boolean(data && data.actions && data.actions['POST']);

  return useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create team'),
        isDisabled: canCreateTeam
          ? undefined
          : t(
              'You do not have permission to create a team. Please contact your organization administrator if there is an issue with your access.'
            ),
        href: getPageUrl(AwxRoute.CreateTeam),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
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
      //   type: PageActionType.Button,
      // selection: PageActionSelection.Multiple,
      //   icon: MinusCircleIcon,
      //   label: t('Remove users from selected teams'),
      //   onClick: () => selectUsersRemoveTeams(view.selectedItems), // This hook has been repurposed as useSelectAndRemoveUsersFromTeam to handle removing users from a single team
      // },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        icon: SyncIcon,
        label: t('Refresh'),
        onClick: () => void view.refresh(),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected teams'),
        onClick: deleteTeams,
        isDanger: true,
      },
    ],
    [canCreateTeam, deleteTeams, getPageUrl, selectUsersAddTeams, t, view]
  );
}
