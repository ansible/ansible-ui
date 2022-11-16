import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { compareStrings } from '../../../../../framework'
import { useBulkAction } from '../../../../../framework/useBulkAction'
import { useNameColumn, useOrganizationNameColumn } from '../../../../common/columns'
import { getItemKey, requestDelete } from '../../../../Data'
import { Team } from '../../../interfaces/Team'
import { useTeamsColumns } from '../Teams'

export function useDeleteTeams(callback: (teams: Team[]) => void) {
  const { t } = useTranslation()
  const columns = useTeamsColumns({ disableLinks: true, disableSort: true })
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
  const deleteActionOrganizationColumn = useOrganizationNameColumn({
    disableLinks: true,
    disableSort: true,
  })
  const progressColumns = useMemo(
    () => [deleteActionNameColumn, deleteActionOrganizationColumn],
    [deleteActionNameColumn, deleteActionOrganizationColumn]
  )
  const bulkAction = useBulkAction<Team>()
  const deleteTeams = (teams: Team[]) => {
    bulkAction({
      title: teams.length === 1 ? t('Permanently delete team') : t('Permanently delete teams'),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} teams.', {
        count: teams.length,
      }),
      submitText: teams.length === 1 ? t('Delete team') : t('Delete teams'),
      items: teams.sort((l, r) => compareStrings(l.name, r.name)),
      errorText: t('There were errors deleting teams', { count: teams.length }),
      keyFn: getItemKey,
      isDanger: true,
      columns,
      progressColumns,
      onClose: callback,
      actionFn: (team: Team) => requestDelete(`/api/v2/teams/${team.id}/`),
    })
  }
  return deleteTeams
}
