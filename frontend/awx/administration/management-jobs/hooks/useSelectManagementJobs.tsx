import { useTranslation } from 'react-i18next';
import { SingleSelectDialog } from '../../../../../framework/PageDialogs/SingleSelectDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { useManagementJobColumns } from './useManagementJobColumns';
import { useManagementJobFilters } from './useManagementJobFilters';
import { useCallback } from 'react';
import { usePageDialog } from '../../../../../framework';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';

function SelectManagementJob(props: {
  title: string;
  onSelect: (template: SystemJobTemplate) => void;
}) {
  const toolbarFilters = useManagementJobFilters();
  const tableColumns = useManagementJobColumns();
  const view = useAwxView<SystemJobTemplate>({
    url: awxAPI`/system_job_templates/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <SingleSelectDialog<SystemJobTemplate>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useSelectManagementJobs() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectSystemJob = useCallback(
    (onSelect: (template: SystemJobTemplate) => void) => {
      setDialog(<SelectManagementJob title={t('Select a system job')} onSelect={onSelect} />);
    },
    [setDialog, t]
  );
  return openSelectSystemJob;
}
