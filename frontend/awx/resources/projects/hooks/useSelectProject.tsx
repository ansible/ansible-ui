import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../../framework';
import { Project } from '../../../interfaces/Project';
import { useAwxView } from '../../../useAwxView';
import { useProjectsColumns } from './useProjectsColumns';
import { useProjectsFilters } from './useProjectsFilters';
import { SelectSingleDialog } from '../../../../../framework/PageDialogs/SelectSingleDialog';
import { useCallback } from 'react';

function SelectProject(props: { title: string; onSelect: (project: Project) => void }) {
  const toolbarFilters = useProjectsFilters();
  const tableColumns = useProjectsColumns({ disableLinks: true });
  const view = useAwxView<Project>({
    url: '/api/v2/projects/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <SelectSingleDialog<Project>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useSelectProject() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectInventory = useCallback(
    (onSelect: (project: Project) => void) => {
      setDialog(<SelectProject title={t('Select project')} onSelect={onSelect} />);
    },
    [setDialog, t]
  );
  return openSelectInventory;
}
