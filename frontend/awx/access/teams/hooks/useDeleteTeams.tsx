import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { useNameColumn, useOrganizationNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { Team } from '../../../interfaces/Team';
import { useTeamsColumns } from './useTeamsColumns';

export function useDeleteTeams(onComplete: (teams: Team[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useTeamsColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const deleteActionOrganizationColumn = useOrganizationNameColumn({
    disableLinks: true,
    disableSort: true,
  });
  const actionColumns = useMemo(
    () => [deleteActionNameColumn, deleteActionOrganizationColumn],
    [deleteActionNameColumn, deleteActionOrganizationColumn]
  );

  const cannotDeleteTeam = (team: Team) => {
    return team?.summary_fields?.user_capabilities?.delete
      ? undefined
      : t('The team cannot be deleted due to insufficient permissions.');
  };

  const bulkAction = useBulkConfirmation<Team>();

  const deleteTeams = (teams: Team[]) => {
    const undeletableTeams = teams.filter(cannotDeleteTeam);

    bulkAction({
      title: t('Permanently delete teams', { count: teams.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} teams.', {
        count: teams.length - undeletableTeams.length,
      }),
      actionButtonText: t('Delete teams', { count: teams.length }),
      items: teams.sort((l, r) => compareStrings(l.name, r.name)),
      alertPrompts:
        undeletableTeams.length > 0
          ? [
              t(
                '{{count}} of the selected teams cannot be deleted due to insufficient permissions.',
                {
                  count: undeletableTeams.length,
                }
              ),
            ]
          : undefined,
      isItemNonActionable: cannotDeleteTeam,
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (team: Team) => requestDelete(`/api/v2/teams/${team.id}/`),
    });
  };
  return deleteTeams;
}
