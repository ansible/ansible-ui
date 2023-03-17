import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { Project } from '../../../interfaces/Project';
import { useAwxView } from '../../../useAwxView';
import { useProjectsColumns, useProjectsFilters } from '../Projects';

export function useSelectProject(isLookup: boolean) {
  const { t } = useTranslation();
  const toolbarFilters = useProjectsFilters();
  const tableColumns = useProjectsColumns({ disableLinks: true });
  const columns = useMemo(
    () =>
      isLookup
        ? tableColumns.filter((item) =>
            ['Name', 'Status', 'Type', 'Organization'].includes(item.header)
          )
        : tableColumns,
    [isLookup, tableColumns]
  );
  const view = useAwxView<Project>({
    url: '/api/v2/projects/',
    toolbarFilters,
    tableColumns: columns,
    disableQueryString: true,
  });
  return {
    useSelectDialog: useSelectDialog<Project>({
      toolbarFilters,
      tableColumns: columns,
      view,
      confirm: t('Confirm'),
      cancel: t('Cancel'),
      selected: t('Selected'),
    }),
    view,
  };
}
