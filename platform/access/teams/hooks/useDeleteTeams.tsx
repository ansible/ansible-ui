import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { useNameColumn } from '../../../../frontend/common/columns';
import { getItemKey, requestDelete } from '../../../../frontend/common/crud/Data';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { useTeamColumns } from './useTeamColumns';

export function useDeleteTeams(onComplete: (teams: PlatformTeam[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useTeamColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({
    header: t('Team'),
    disableLinks: true,
    disableSort: true,
  });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  // TODO: Update based on RBAC information from Teams API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cannotDeleteTeam = (team: PlatformTeam) => {
    // eslint-disable-next-line no-constant-condition
    return true //team?.summary_fields?.user_capabilities?.delete
      ? undefined
      : t('The team cannot be deleted due to insufficient permissions.');
  };
  const bulkAction = useBulkConfirmation<PlatformTeam>();
  const deleteTeams = (teams: PlatformTeam[]) => {
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
      actionFn: (team: PlatformTeam, signal) =>
        requestDelete(gatewayAPI`/v1/teams/${team.id.toString()}/`, signal),
    });
  };
  return deleteTeams;
}
