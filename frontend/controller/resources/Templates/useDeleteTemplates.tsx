import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkConfirmationDialog, compareStrings, usePageDialog } from '../../../../framework'
import { useNameColumn } from '../../../common/columns'
import { getItemKey, requestDelete } from '../../../Data'
import { Template } from './Template'
import { useTemplatesColumns } from './Templates'

export function useDeleteTemplates(callback: (templates: Template[]) => void) {
  const { t } = useTranslation()
  const [_, setDialog] = usePageDialog()
  const columns = useTemplatesColumns({ disableLinks: true, disableSort: true })
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
  const errorColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
  const deleteTemplates = (items: Template[]) => {
    setDialog(
      <BulkConfirmationDialog<Template>
        title={t('Permanently delete templates', { count: items.length })}
        confirmText={t('Yes, I confirm that I want to delete these {{count}} templates.', {
          count: items.length,
        })}
        submitText={t('Delete templates', { count: items.length })}
        submitting={t('Deleting templates', { count: items.length })}
        submittingTitle={t('Deleting {{count}} templates', { count: items.length })}
        error={t('There were errors deleting templates', { count: items.length })}
        items={items.sort((l, r) => compareStrings(l.name, r.name))}
        keyFn={getItemKey}
        isDanger
        columns={columns}
        errorColumns={errorColumns}
        onConfirm={callback}
        action={(template: Template) => requestDelete(`/api/v2/instance-groups/${template.id}/`)}
      />
    )
  }
  return deleteTemplates
}
