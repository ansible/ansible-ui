import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../../framework';
import { SingleSelectDialog } from '../../../../../framework/PageDialogs/SingleSelectDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { useTemplateColumns } from './useTemplateColumns';
import { useTemplateFilters } from './useTemplateFilters';

function SelectWorkflowJobTemplate(props: {
  title: string;
  onSelect: (template: WorkflowJobTemplate) => void;
}) {
  const toolbarFilters = useTemplateFilters();
  const tableColumns = useTemplateColumns({ disableLinks: true });
  const view = useAwxView<WorkflowJobTemplate>({
    url: awxAPI`/job_templates/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <SingleSelectDialog<WorkflowJobTemplate>
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
