import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { Project } from '../../../interfaces/Project';
import { useAwxView } from '../../../useAwxView';
import { useProjectsColumns, useProjectsFilters } from '../Projects';

export function useSelectProject() {
  const { t } = useTranslation();
  const toolbarFilters = useProjectsFilters();
  const tableColumns = useProjectsColumns({ disableLinks: true });

  const view = useAwxView<Project>({
    url: '/api/v2/projects/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return {
    useSelectDialog: useSelectDialog<Project>({
      toolbarFilters,
      tableColumns,
      view,
      confirm: t('Confirm'),
      cancel: t('Cancel'),
      selected: t('Selected'),
    }),
    view,
  };
}
