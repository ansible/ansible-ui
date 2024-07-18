import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Team } from '../../../interfaces/Team';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useSelectAndRemoveUsersFromTeam } from '../../users/hooks/useSelectAndRemoveUsersFromTeam';
import { useSelectUsersAddTeams } from '../../users/hooks/useSelectUsersAddTeams';
import { useDeleteTeams } from './useDeleteTeams';

export function useTeamActions(options: {
  onTeamsDeleted: (teams: Team[]) => void;
  isDetailsPageAction?: boolean;
}) {
  const { onTeamsDeleted } = options;
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteTeams = useDeleteTeams(onTeamsDeleted);
  const selectUsersAddTeams = useSelectUsersAddTeams();
  const selectAndRemoveUsersFromTeam = useSelectAndRemoveUsersFromTeam();
  const { activeAwxUser } = useAwxActiveUser();

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
      activeAwxUser?.is_superuser || team?.summary_fields?.user_capabilities?.edit
        ? ''
        : t(
            `You do not have permission to remove users. Please contact your organization administrator if there is an issue with your access.`
          );
    const cannotAddUsers = (team: Team) =>
      activeAwxUser?.is_superuser || team?.summary_fields?.user_capabilities?.edit
        ? ''
        : t(
            `You do not have permission to add users. Please contact your organization administrator if there is an issue with your access.`
          );

    const actions: IPageAction<Team>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit team'),
        isDisabled: (team: Team) => cannotEditTeam(team),
        onClick: (team) => pageNavigate(AwxRoute.EditTeam, { params: { id: team.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PlusCircleIcon,
        label: t('Add users to teams'),
        isDisabled: (team: Team) => cannotAddUsers(team),
        onClick: (team) => selectUsersAddTeams([team]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove users from teams'),
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
    activeAwxUser?.is_superuser,
    deleteTeams,
    pageNavigate,
    selectAndRemoveUsersFromTeam,
    selectUsersAddTeams,
    t,
  ]);
}
