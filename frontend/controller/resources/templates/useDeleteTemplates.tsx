import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { useNameColumn } from '../../../common/columns';
import { getItemKey, requestDelete } from '../../../Data';
import { Template } from '../../interfaces/Template';
import { useTemplatesColumns } from './Templates';

export function useDeleteTemplates(onComplete: (templates: Template[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useTemplatesColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useBulkConfirmation<Template>();
  const deleteTemplates = (templates: Template[]) => {
    bulkAction({
      title:
        templates.length === 1
          ? t('Permanently delete template')
          : t('Permanently delete templates'),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} templates.', {
        count: templates.length,
      }),
      actionButtonText: t('Delete template', { count: templates.length }),
      items: templates.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (template: Template) => requestDelete(`/api/v2/job_templates/${template.id}/`),
    });
  };
  return deleteTemplates;
}
