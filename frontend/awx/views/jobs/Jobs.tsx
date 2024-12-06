import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';

import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { useTranslation } from 'react-i18next';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useJobsColumns } from './hooks/useJobsColumns';
import { JobsList } from './JobsList';

export function Jobs() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const tableColumns = useJobsColumns();

  usePersistentFilters('jobs');
  const config = useAwxConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('Jobs')}
        titleHelpTitle={t('Jobs')}
        titleHelp={t(
          `A job is an instance of {{product}} launching an Ansible playbook against an inventory of hosts.`,
          { product }
        )}
        titleDocLink={useGetDocsUrl(config, 'jobs')}
        description={t(
          `A job is an instance of {{product}} launching an Ansible playbook against an inventory of hosts.`,
          { product }
        )}
        headerActions={<ActivityStreamIcon type={'job'} />}
      />
      <JobsList columns={tableColumns} />
    </PageLayout>
  );
}
