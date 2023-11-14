import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { Project } from '../../../interfaces/Project';
import { useAwxView } from '../../../useAwxView';
import { awxAPI } from '../../../api/awx-utils';
import { useProjectsColumns } from './useProjectsColumns';
import { useProjectsFilters } from './useProjectsFilters';

export function useSelectProjects() {
  const { t } = useTranslation();
  const toolbarFilters = useProjectsFilters();
  const tableColumns = useProjectsColumns({ disableLinks: true });
  const view = useAwxView<Project>({
    url: awxAPI`/projects/`,
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
