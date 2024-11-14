import { usePageDialog } from '@ansible/ansible-ui-framework';
import { SingleSelectDialog } from '@ansible/ansible-ui-framework/PageDialogs/SingleSelectDialog';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { useManagementJobColumns } from './useManagementJobColumns';
import { useManagementJobFilters } from './useManagementJobFilters';

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
