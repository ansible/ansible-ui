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
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { Team } from '../../../interfaces/Team';
import { IControllerView } from '../../../useControllerView';
import { useSelectUsersAddTeams } from '../../users/hooks/useSelectUsersAddTeams';
import { useSelectUsersRemoveTeams } from '../../users/hooks/useSelectUsersRemoveTeams';
import { useDeleteTeams } from './useDeleteTeams';

export function useTeamToolbarActions(view: IControllerView<Team>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteTeams = useDeleteTeams(view.unselectItemsAndRefresh);
  const selectUsersAddTeams = useSelectUsersAddTeams();
  const selectUsersRemoveTeams = useSelectUsersRemoveTeams();
  return useMemo<IPageAction<Team>[]>(
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
}
