import { useTranslation } from 'react-i18next'
import { compareStrings, useBulkConfirmation } from '../../../../framework'
import { requestDelete } from '../../../Data'
import { idKeyFn } from '../../../hub/useHubView'
import { EdaProject } from '../../interfaces/EdaProject'
import { useProjectsColumns } from './useProjectsColumns'

export function useDeleteProjects(onComplete: (projects: EdaProject[]) => void) {
  const { t } = useTranslation()
  const confirmationColumns = useProjectsColumns()
  const actionColumns = [confirmationColumns[0]]
  const bulkAction = useBulkConfirmation<EdaProject>()
  const deleteProjects = (projects: EdaProject[]) => {
    bulkAction({
      title: t('Permanently delete projects', { count: projects.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} projects.', {
        count: projects.length,
      }),
      actionButtonText: t('Delete projects', { count: projects.length }),
      items: projects.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: idKeyFn,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (project: EdaProject) => requestDelete(`/api/projects/${project.id}`),
    })
  }
  return deleteProjects
}
