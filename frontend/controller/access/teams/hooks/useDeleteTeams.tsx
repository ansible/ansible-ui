import { Icon, Tooltip } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, ITableColumn, useBulkConfirmation } from '../../../../../framework';
import { useNameColumn, useOrganizationNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../Data';
import { Team } from '../../../interfaces/Team';
import { useTeamsColumns } from './useTeamsColumns';

export function useDeleteTeams(onComplete: (teams: Team[]) => void) {
  const { t } = useTranslation();
  const teamColumns = useTeamsColumns({ disableLinks: true, disableSort: true });
  const canDeleteTeam = (team: Team) => team?.summary_fields?.user_capabilities?.delete;
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

  const deleteTeams = (teams: Team[]) => {
    const deletableTeams = teams.filter(canDeleteTeam);
    const undeletableTeamsCount = teams.length - deletableTeams.length;
    const confirmationColumns: ITableColumn<Team>[] = [
      ...(undeletableTeamsCount > 0
        ? [
            {
              header: '',
              cell: (team: Team) =>
                canDeleteTeam(team) ? null : (
                  <Tooltip
                    content={t('The team cannot be deleted due to insufficient permissions.')}
                    trigger="manual"
                  >
                    <Icon status="danger">
                      <ExclamationCircleIcon />
                    </Icon>
                  </Tooltip>
                ),
            },
          ]
        : []),
      ...teamColumns,
    ];

    bulkAction({
      title: t('Permanently delete teams', { count: teams.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} teams.', {
        count: deletableTeams.length,
      }),
      actionButtonText: t('Delete teams', { count: teams.length }),
      items:
        undeletableTeamsCount > 0
          ? teams.sort((l, r) => Number(canDeleteTeam(l)) - Number(canDeleteTeam(r)))
          : teams.sort((l, r) => compareStrings(l.name, r.name)),
      actionableItems: deletableTeams.sort((l, r) => compareStrings(l.name, r.name)),
      alertPrompt:
        undeletableTeamsCount > 0
          ? t(
              '{{count}} of the selected teams cannot be deleted due to insufficient permissions.',
              {
                count: undeletableTeamsCount,
              }
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
