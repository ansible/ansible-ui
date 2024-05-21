import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { useEdaBulkConfirmation } from '../../../common/useEdaBulkConfirmation';
import { edaAPI } from '../../../common/eda-utils';
import { EdaTeam } from '../../../interfaces/EdaTeam';
import { useTeamColumns } from './useTeamColumns';

export function useDeleteTeams(onComplete: (teams: EdaTeam[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useTeamColumns();
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useEdaBulkConfirmation<EdaTeam>();
  const deleteTeams = (teams: EdaTeam[]) => {
    bulkAction({
      title: t('Permanently delete teams', { count: teams.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} teams.', {
        count: teams.length,
      }),
      actionButtonText: t('Delete teams', { count: teams.length }),
      items: teams.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (team: EdaTeam, signal) =>
        requestDelete(edaAPI`/teams/${team.id.toString()}/`, signal),
    });
  };
  return deleteTeams;
}
