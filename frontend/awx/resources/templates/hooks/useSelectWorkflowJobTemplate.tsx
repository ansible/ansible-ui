import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../../framework';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { useAwxView } from '../../../useAwxView';
import { useTemplateColumns } from './useTemplateColumns';
import { useTemplateFilters } from './useTemplateFilters';
import { SelectSingleDialog } from '../../../../../framework/PageDialogs/SelectSingleDialog';
import { useCallback } from 'react';

function SelectWorkflowJobTemplate(props: {
  title: string;
  onSelect: (template: WorkflowJobTemplate) => void;
}) {
  const toolbarFilters = useTemplateFilters();
  const tableColumns = useTemplateColumns({ disableLinks: true });
  const view = useAwxView<WorkflowJobTemplate>({
    url: '/api/v2/job_templates/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <SelectSingleDialog<WorkflowJobTemplate>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useSelectWorkflowJobTemplate() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectInventory = useCallback(
    (onSelect: (template: WorkflowJobTemplate) => void) => {
      setDialog(<SelectWorkflowJobTemplate title={t('Select job template')} onSelect={onSelect} />);
    },
    [setDialog, t]
  );
  return openSelectInventory;
}
