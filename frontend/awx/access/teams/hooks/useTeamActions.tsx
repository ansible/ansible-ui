import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, MinusCircleIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Team } from '../../../interfaces/Team';
import { useSelectUsersAddTeams } from '../../users/hooks/useSelectUsersAddTeams';
import { useSelectAndRemoveUsersFromTeam } from '../../users/hooks/useSelectAndRemoveUsersFromTeam';
import { useDeleteTeams } from './useDeleteTeams';

export function useTeamActions(options: { onTeamsDeleted: (teams: Team[]) => void }) {
  const { onTeamsDeleted } = options;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteTeams = useDeleteTeams(onTeamsDeleted);
  const selectUsersAddTeams = useSelectUsersAddTeams();
  const selectAndRemoveUsersFromTeam = useSelectAndRemoveUsersFromTeam();

  return useMemo<IPageAction<Team>[]>(() => {
    const cannotDeleteTeam = (team: Team) =>
      team?.summary_fields?.user_capabilities?.delete
        ? ''
        : t(`The team cannot be deleted due to insufficient permission`);
    const cannotEditTeam = (team: Team) =>
      team?.summary_fields?.user_capabilities?.edit
        ? ''
        : t(`The team cannot be edited due to insufficient permission`);

    return [
      {
        type: PageActionType.single,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit team'),
        isDisabled: (team: Team) => cannotEditTeam(team),
        onClick: (team) => navigate(RouteObj.EditTeam.replace(':id', team.id.toString())),
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
        onClick: (team) => selectAndRemoveUsersFromTeam(team),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete team'),
        isDisabled: (team: Team) => cannotDeleteTeam(team),
        onClick: (team) => deleteTeams([team]),
        isDanger: true,
      },
    ];
  }, [deleteTeams, navigate, selectAndRemoveUsersFromTeam, selectUsersAddTeams, t]);
}
