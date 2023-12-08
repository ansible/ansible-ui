import { useTranslation } from 'react-i18next';
import { SelectSingleDialog } from '../../../../../framework/PageDialogs/SelectSingleDialog';
import { useAwxView } from '../../../useAwxView';
import { awxAPI } from '../../../api/awx-utils';
import { useTemplateColumns } from './useTemplateColumns';
import { useTemplateFilters } from './useTemplateFilters';
import { usePageDialog } from '../../../../../framework';
import { useCallback } from 'react';
import { JobTemplate } from '../../../interfaces/JobTemplate';

function SelectJobTemplate(props: { title: string; onSelect: (template: JobTemplate) => void }) {
  const toolbarFilters = useTemplateFilters();
  const tableColumns = useTemplateColumns({ disableLinks: true });
  const view = useAwxView<JobTemplate>({
    url: awxAPI`/job_templates/`,
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
  const openSelectTemplate = useCallback(
    (onSelect: (template: JobTemplate) => void) => {
      setDialog(<SelectJobTemplate title={t('Select job template')} onSelect={onSelect} />);
    },
    [setDialog, t]
  );
  return openSelectTemplate;
}
