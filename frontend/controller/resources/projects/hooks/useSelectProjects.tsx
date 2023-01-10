import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { Project } from '../../../interfaces/Project';
import { useControllerView } from '../../../useControllerView';
import { useProjectsColumns, useProjectsFilters } from '../../projects/Projects';

export function useSelectProjects() {
  const { t } = useTranslation();
  const toolbarFilters = useProjectsFilters();
  const tableColumns = useProjectsColumns({ disableLinks: true });
  const view = useControllerView<Project>({
    url: '/api/v2/projects/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return useSelectDialog<Project>({
    toolbarFilters,
    tableColumns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
  });
}
