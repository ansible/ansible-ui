import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { useAwxView } from '../../../useAwxView';
import { useTemplateFilters, useTemplatesColumns } from '../Templates';

export function useSelectJobTemplate() {
  const { t } = useTranslation();
  const toolbarFilters = useTemplateFilters();
  const tableColumns = useTemplatesColumns({ disableLinks: true });
  const view = useAwxView<JobTemplate>({
    url: '/api/v2/job_templates/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return useSelectDialog<JobTemplate>({
    toolbarFilters,
    tableColumns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
  });
}
