import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../../framework';
import { SingleSelectDialog } from '../../../../../framework/PageDialogs/SingleSelectDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Project } from '../../../interfaces/Project';
import { useProjectsColumns } from './useProjectsColumns';
import { useProjectsFilters } from './useProjectsFilters';

function SelectProject(props: { title: string; onSelect: (project: Project) => void }) {
  const toolbarFilters = useProjectsFilters();
  const tableColumns = useProjectsColumns({ disableLinks: true });
  const view = useAwxView<Project>({
    url: awxAPI`/projects/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <SingleSelectDialog<Project>
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
