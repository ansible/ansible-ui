import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { SystemJobTemplate } from '../../interfaces/SystemJobTemplate';
import { useAwxConfig } from '../../common/useAwxConfig';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { useManagementJobFilters } from './hooks/useManagementJobFilters';
import { useManagementJobColumns } from './hooks/useManagementJobColumns';
import { useAwxView } from '../../common/useAwxView';
import { awxAPI } from '../../common/api/awx-utils';
import { useManagementJobRowActions } from './hooks/useManagementJobRowActions';

export function ManagementJobs() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  const toolbarFilters = useManagementJobFilters();
  const tableColumns = useManagementJobColumns();
  const view = useAwxView<SystemJobTemplate>({
    url: awxAPI`/system_job_templates/`,
    toolbarFilters,
    tableColumns,
  });
  const isPrompted = managementJob.job_type &&
  ['cleanup_activitystream', 'cleanup_jobs'].includes(managementJob.job_type);

  const rowActions = useManagementJobRowActions(view, isPrompted);

  return (
    <PageLayout>
      <PageHeader
        title={t('Management Jobs')}
        description={t(
          'Management Jobs assist in the cleaning of old data including system tracking information, tokens, job histories, and activity streams.'
        )}
        titleHelpTitle={t('Management Jobs')}
        titleHelp={t(
          'Management Jobs assist in the cleaning of old data including system tracking information, tokens, job histories, and activity streams.'
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/management_jobs.html`}
      />
      <PageTable<SystemJobTemplate>
        id="awx-management-jobs"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        rowActions={rowActions}
        loadingStateTitle={t('Loading management jobs')}
        errorStateTitle={t('Error loading management jobs')}
        emptyStateTitle="No management jobs yet"
        {...view}
      />
    </PageLayout>
  );
}
