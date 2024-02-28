import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../../framework';
import { SingleSelectDialog } from '../../../../../framework/PageDialogs/SingleSelectDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { useTemplateColumns } from './useTemplateColumns';
import { useTemplateFilters } from './useTemplateFilters';

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
    <SingleSelectDialog<JobTemplate>
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
