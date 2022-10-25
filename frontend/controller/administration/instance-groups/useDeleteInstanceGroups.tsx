import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkActionDialog, compareStrings, usePageDialog } from '../../../../framework'
import { useNameColumn } from '../../../common/columns'
import { getItemKey, requestDelete } from '../../../Data'
import { InstanceGroup } from './InstanceGroup'
import { useInstanceGroupsColumns } from './InstanceGroups'

export function useDeleteInstanceGroups(callback: (teams: InstanceGroup[]) => void) {
  const { t } = useTranslation()
  const [_, setDialog] = usePageDialog()
  const columns = useInstanceGroupsColumns({ disableLinks: true, disableSort: true })
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
  const errorColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
  const deleteInstanceGroups = (items: InstanceGroup[]) => {
    setDialog(
      <BulkActionDialog<InstanceGroup>
        title={t('Permanently delete instance groups', { count: items.length })}
        confirmText={t('Yes, I confirm that I want to delete these {{count}} teams.', {
          count: items.length,
        })}
        submitText={t('Delete teams', { count: items.length })}
        submitting={t('Deleting teams', { count: items.length })}
        submittingTitle={t('Deleting {{count}} teams', { count: items.length })}
        error={t('There were errors deleting teams', { count: items.length })}
        items={items.sort((l, r) => compareStrings(l.name, r.name))}
        keyFn={getItemKey}
        isDanger
        columns={columns}
        errorColumns={errorColumns}
        onClose={callback}
        action={(ig: InstanceGroup) => requestDelete(`/api/v2/instance-groups/${ig.id}/`)}
      />
    )
  }
  return deleteInstanceGroups
}
