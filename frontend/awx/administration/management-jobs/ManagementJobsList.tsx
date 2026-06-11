import { PageHeader, PageLayout, PageTable } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { SystemJobTemplate } from '../../interfaces/SystemJobTemplate';
import { useManagementJobColumns } from './hooks/useManagementJobColumns';
import { useManagementJobFilters } from './hooks/useManagementJobFilters';
import { useManagementJobRowActions } from './hooks/useManagementJobRowActions';

export function ManagementJobs() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  const toolbarFilters = useManagementJobFilters();
  const tableColumns = useManagementJobColumns();
  const rowActions = useManagementJobRowActions();

  const view = useAwxView<SystemJobTemplate>({
    url: awxAPI`/system_job_templates/`,
    toolbarFilters,
    tableColumns,
  });

  return (
    <PageLayout>
      <PageHeader
        title={t('Management Jobs')}
        description={t(
          'Management jobs assist in the cleaning of old data including system tracking information, tokens, job histories, and activity streams.'
        )}
        titleHelpTitle={t('Management Jobs')}
        titleHelp={t(
          'Management jobs assist in the cleaning of old data including system tracking information, tokens, job histories, and activity streams.'
        )}
        titleDocLink={useGetDocsUrl(config, 'managementJobs')}
      />
      <PageTable<SystemJobTemplate>
        id="awx-management-jobs"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading management jobs')}
        emptyStateTitle={t('No management jobs yet')}
        {...view}
      />
    </PageLayout>
  );
}
