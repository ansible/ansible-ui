import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { awxAPI } from '../../../common/api/awx-utils';
import { IAwxView } from '../../../common/useAwxView';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Team } from '../../../interfaces/Team';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useSelectUsersAddTeams } from '../../users/hooks/useSelectUsersAddTeams';
import { useDeleteTeams } from './useDeleteTeams';

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
        icon: PlusCircleIcon,
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
        label: t('Add users to teams'),
        onClick: () => selectUsersAddTeams(view.selectedItems),
      },
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
        label: t('Delete teams'),
        onClick: deleteTeams,
        isDanger: true,
      },
    ],
    [canCreateTeam, deleteTeams, getPageUrl, selectUsersAddTeams, t, view]
  );
}
