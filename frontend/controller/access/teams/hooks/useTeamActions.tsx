import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, MinusCircleIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteE } from '../../../../Routes';
import { Team } from '../../../interfaces/Team';
import { useSelectUsersAddTeams } from '../../users/hooks/useSelectUsersAddTeams';
import { useSelectUsersRemoveTeams } from '../../users/hooks/useSelectUsersRemoveTeams';
import { useDeleteTeams } from './useDeleteTeams';

export function useTeamActions(options: { onTeamsDeleted: (teams: Team[]) => void }) {
  const { onTeamsDeleted } = options;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteTeams = useDeleteTeams(onTeamsDeleted);
  const selectUsersAddTeams = useSelectUsersAddTeams();
  const selectUsersRemoveTeams = useSelectUsersRemoveTeams();
  return useMemo<IPageAction<Team>[]>(
    () => [
      {
        type: PageActionType.single,
        variant: ButtonVariant.primary,
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
        isDanger: true,
      },
    ],
    [deleteTeams, navigate, selectUsersAddTeams, selectUsersRemoveTeams, t]
  );
}
