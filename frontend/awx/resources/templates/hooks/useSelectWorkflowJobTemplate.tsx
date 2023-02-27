import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { useAwxView } from '../../../useAwxView';
import { useTemplateFilters, useTemplatesColumns } from '../Templates';

export function useSelectWorkflowJobTemplate() {
  const { t } = useTranslation();
  const toolbarFilters = useTemplateFilters();
  const tableColumns = useTemplatesColumns({ disableLinks: true });
  const view = useAwxView<WorkflowJobTemplate>({
    url: '/api/v2/workflow_job_templates/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return useSelectDialog<WorkflowJobTemplate>({
    toolbarFilters,
    tableColumns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
  });
}
