import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { Template } from '../../../interfaces/Template';
import { useControllerView } from '../../../useControllerView';
import { useTemplateFilters, useTemplatesColumns } from '../Templates';

export function useSelectJobTemplate() {
  const { t } = useTranslation();
  const toolbarFilters = useTemplateFilters();
  const tableColumns = useTemplatesColumns({ disableLinks: true });
  const view = useControllerView<Template>({
    url: '/api/v2/job_templates/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return useSelectDialog<Template>({
    toolbarFilters,
    tableColumns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
  });
}
