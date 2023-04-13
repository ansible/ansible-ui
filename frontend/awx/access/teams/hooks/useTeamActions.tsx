import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, MinusCircleIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { useActiveUser } from '../../../../common/useActiveUser';
import { Team } from '../../../interfaces/Team';
import { useSelectAndRemoveUsersFromTeam } from '../../users/hooks/useSelectAndRemoveUsersFromTeam';
import { useSelectUsersAddTeams } from '../../users/hooks/useSelectUsersAddTeams';
import { useDeleteTeams } from './useDeleteTeams';

export function useTeamActions(options: {
  onTeamsDeleted: (teams: Team[]) => void;
  isDetailsPageAction?: boolean;
}) {
  const { onTeamsDeleted, isDetailsPageAction } = options;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteTeams = useDeleteTeams(onTeamsDeleted);
  const selectUsersAddTeams = useSelectUsersAddTeams();
  const selectAndRemoveUsersFromTeam = useSelectAndRemoveUsersFromTeam();
  const activeUser = useActiveUser();

  return useMemo(() => {
    const cannotDeleteTeam = (team: Team) =>
      team?.summary_fields?.user_capabilities?.delete
        ? ''
        : t(`The team cannot be deleted due to insufficient permissions.`);
    const cannotEditTeam = (team: Team) =>
      team?.summary_fields?.user_capabilities?.edit
        ? ''
        : t(`The team cannot be edited due to insufficient permissions.`);
    const cannotRemoveUsers = (team: Team) =>
      activeUser?.is_superuser || team?.summary_fields?.user_capabilities?.edit
        ? ''
        : t(
            `You do not have permission to remove users. Please contact your Organization Administrator if there is an issue with your access.`
          );
    const cannotAddUsers = (team: Team) =>
      activeUser?.is_superuser || team?.summary_fields?.user_capabilities?.edit
        ? ''
        : t(
            `You do not have permission to add users. Please contact your Organization Administrator if there is an issue with your access.`
          );

    const actions: IPageAction<Team>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: EditIcon,
        label: t('Edit team'),
        isDisabled: (team: Team) => cannotEditTeam(team),
        onClick: (team) => navigate(RouteObj.EditTeam.replace(':id', team.id.toString())),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PlusCircleIcon,
        label: t('Add users'),
        isDisabled: (team: Team) => cannotAddUsers(team),
        onClick: (team) => selectUsersAddTeams([team]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove users'),
        isDisabled: (team: Team) => cannotRemoveUsers(team),
        onClick: (team) => selectAndRemoveUsersFromTeam(team),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete team'),
        isDisabled: (team: Team) => cannotDeleteTeam(team),
        onClick: (team) => deleteTeams([team]),
        isDanger: true,
      },
    ];
    return actions;
  }, [
    activeUser?.is_superuser,
    deleteTeams,
    navigate,
    selectAndRemoveUsersFromTeam,
    selectUsersAddTeams,
    t,
  ]);
}
