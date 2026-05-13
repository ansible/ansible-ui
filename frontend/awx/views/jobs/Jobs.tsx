import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { Domains } from '../../common/domains/Domains';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useJobsColumns } from './hooks/useJobsColumns';
import { JobsList } from './JobsList';

export function Jobs() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('Automation controller');
  const tableColumns = useJobsColumns();

  usePersistentFilters('jobs');
  const config = useAwxConfig();

  // Read URL search params and pass them to JobsList for filtering
  const [searchParams] = useSearchParams();
  const queryParams = useMemo(() => {
    const params: { [key: string]: string } = {};
    searchParams.forEach((value, key) => {
      // Only pass through API filter params, not UI state params
      if (!['page', 'perPage', 'sort'].includes(key)) {
        params[key] = value;
      }
    });
    return params;
  }, [searchParams]);

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
      <Domains />
      <JobsList columns={tableColumns} queryParams={queryParams} />
    </PageLayout>
  );
}
