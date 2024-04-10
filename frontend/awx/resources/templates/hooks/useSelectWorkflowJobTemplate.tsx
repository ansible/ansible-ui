import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, usePageDialog } from '../../../../../framework';
import { SingleSelectDialog } from '../../../../../framework/PageDialogs/SingleSelectDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { useTemplateColumns } from './useTemplateColumns';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../../common/awx-toolbar-filters';

function SelectWorkflowJobTemplate(props: {
  title: string;
  onSelect: (template: WorkflowJobTemplate) => void;
}) {
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  );
  const tableColumns = useTemplateColumns({ disableLinks: true });
  const view = useAwxView<WorkflowJobTemplate>({
    url: awxAPI`/workflow_job_templates/`,
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
      setDialog(
        <SelectWorkflowJobTemplate title={t('Select workflow job template')} onSelect={onSelect} />
      );
    },
    [setDialog, t]
  );
  return openSelectInventory;
}
