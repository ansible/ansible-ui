import { useTranslation } from 'react-i18next';
import { SelectSingleDialog } from '../../../../../framework/PageDialogs/SelectSingleDialog';
import { useAwxView } from '../../../useAwxView';
import { useTemplateColumns } from './useTemplateColumns';
import { useTemplateFilters } from './useTemplateFilters';
import { usePageDialog } from '../../../../../framework';
import { useCallback } from 'react';
import { JobTemplate } from '../../../interfaces/JobTemplate';

function SelectJobTemplate(props: { title: string; onSelect: (template: JobTemplate) => void }) {
  const toolbarFilters = useTemplateFilters();
  const tableColumns = useTemplateColumns({ disableLinks: true });
  const view = useAwxView<JobTemplate>({
    url: '/api/v2/job_templates/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <SelectSingleDialog<JobTemplate>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useSelectJobTemplate() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectInventory = useCallback(
    (onSelect: (template: JobTemplate) => void) => {
      setDialog(<SelectJobTemplate title={t('Select job template')} onSelect={onSelect} />);
    },
    [setDialog, t]
  );
  return openSelectInventory;
}
