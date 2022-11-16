import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { compareStrings, useBulkConfirmation } from '../../../../framework'
import { useNameColumn } from '../../../common/columns'
import { getItemKey, requestDelete } from '../../../Data'
import { InstanceGroup } from './InstanceGroup'
import { useInstanceGroupsColumns } from './InstanceGroups'

export function useDeleteInstanceGroups(onComplete: (instanceGroups: InstanceGroup[]) => void) {
  const { t } = useTranslation()
  const confirmationColumns = useInstanceGroupsColumns({ disableLinks: true, disableSort: true })
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
  const bulkAction = useBulkConfirmation<InstanceGroup>()
  const deleteInstanceGroups = (instanceGroups: InstanceGroup[]) => {
    bulkAction({
      title:
        instanceGroups.length === 1
          ? t('Permanently delete instance group')
          : t('Permanently delete instance groups'),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} instance groups.', {
        count: instanceGroups.length,
      }),
      actionButtonText: t('Delete instance group', { count: instanceGroups.length }),
      items: instanceGroups.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (instanceGroup: InstanceGroup) =>
        requestDelete(`/api/v2/instance-groups/${instanceGroup.id}/`),
    })
  }
  return deleteInstanceGroups
}
