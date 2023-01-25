import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { useNameColumn, useOrganizationNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../Data';
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
  const bulkAction = useBulkConfirmation<Team>();
  const canDeleteTeam = (team: Team) => team?.summary_fields?.user_capabilities?.delete;
  const deleteTeams = (teams: Team[]) => {
    const deletableTeams = teams.filter(canDeleteTeam);
    const undeletableTeamsCount = teams.length - deletableTeams.length;
    bulkAction({
      title: t('Permanently delete teams', { count: teams.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} teams.', {
        count: teams.length,
      }),
      actionButtonText: t('Delete teams', { count: teams.length }),
      items: deletableTeams.sort((l, r) => compareStrings(l.name, r.name)),
      alertPrompt:
        undeletableTeamsCount > 0
          ? t(
              '{{count}} of the selected teams cannot be deleted due to insufficient permission. Teams that can be deleted are shown below.',
              { count: undeletableTeamsCount }
            )
          : undefined,
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
