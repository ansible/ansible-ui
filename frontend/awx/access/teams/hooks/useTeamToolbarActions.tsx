import { ButtonVariant } from '@patternfly/react-core';
import {
  MinusCircleIcon,
  PlusCircleIcon,
  PlusIcon,
  SyncIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, IPageActionButton, PageActionType } from '../../../../../framework';
import { useOptions } from '../../../../Data';
import { RouteE } from '../../../../Routes';
import { Team } from '../../../interfaces/Team';
import { IAwxView } from '../../../useAwxView';
import { useSelectUsersAddTeams } from '../../users/hooks/useSelectUsersAddTeams';
import { useSelectUsersRemoveTeams } from '../../users/hooks/useSelectUsersRemoveTeams';
import { useDeleteTeams } from './useDeleteTeams';
import { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';

export function useTeamToolbarActions(view: IAwxView<Team>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteTeams = useDeleteTeams(view.unselectItemsAndRefresh);
  const selectUsersAddTeams = useSelectUsersAddTeams();
  const selectUsersRemoveTeams = useSelectUsersRemoveTeams();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>({ url: '/api/v2/teams/' });
  const canCreateTeam = Boolean(data && data.actions && data.actions['POST']);

  return useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create team'),
        isDisabled: canCreateTeam
          ? undefined
          : t(
              'You do not have permission to create a team. Please contact your Organization Administrator if there is an issue with your access.'
            ),
        onClick: () => navigate(RouteE.CreateTeam),
      } as IPageActionButton,
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
        isDanger: true,
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.button,
        icon: SyncIcon,
        label: t('Refresh'),
        onClick: () => void view.refresh(),
      },
    ],
    [canCreateTeam, deleteTeams, navigate, selectUsersAddTeams, selectUsersRemoveTeams, t, view]
  );
}
