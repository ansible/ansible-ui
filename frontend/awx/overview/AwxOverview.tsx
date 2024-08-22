/* eslint-disable i18next/no-literal-string */
import { Bullseye, Button, PageSection, Spinner } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { PageHeader, PageLayout } from '../../../framework';
import { PageDashboard } from '../../../framework/PageDashboard/PageDashboard';
import { awxAPI } from '../common/api/awx-utils';
import { AwxCountsCard } from './cards/AwxCountsCard';
import { AwxJobActivityCard } from './cards/AwxJobActivityCard';
import { AwxRecentInventoriesCard } from './cards/AwxRecentInventoriesCard';
import { AwxRecentJobsCard } from './cards/AwxRecentJobsCard';
import { AwxRecentProjectsCard } from './cards/AwxRecentProjectsCard';
import { useManagedAwxDashboard } from './hooks/useManagedAwxDashboard';

type Resource = { id: string; name: string };

export function AwxOverview() {
  const { t } = useTranslation();
  const { openManageDashboard, managedResources } = useManagedAwxDashboard();
  const product: string = process.env.PRODUCT ?? t('AWX');
  function renderCustomizeControls() {
    return (
      <Button icon={<CogIcon />} variant="link" onClick={openManageDashboard}>
        {t('Manage view')}
      </Button>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={t(`Welcome to {{product}}`, { product })}
        description={t('Define, operate, scale, and delegate automation across your enterprise.')}
        controls={renderCustomizeControls()}
      />
      <AwxOverviewInternal managedResources={managedResources} />
    </PageLayout>
  );
}

function AwxOverviewInternal(props: { managedResources: Resource[] }) {
  const { managedResources } = props;
  const { data, isLoading } = useSWR<IAwxDashboardData>(awxAPI`/dashboard/`, (url: string) =>
    fetch(url).then((r) => r.json())
  );
  if (!data || isLoading) {
    return (
      <PageSection isFilled>
        <Bullseye>
          <Spinner />
        </Bullseye>
      </PageSection>
    );
  }

  return (
    <PageDashboard>
      {managedResources.map((resource: Resource) => {
        switch (resource.id) {
          case 'counts':
            return <AwxCountsCard key={resource.id} data={data} />;
          case 'recent_job_activity':
            return <AwxJobActivityCard key={resource.id} />;
          case 'recent_jobs':
            return <AwxRecentJobsCard key={resource.id} />;
          case 'recent_projects':
            return <AwxRecentProjectsCard key={resource.id} />;
          case 'recent_inventories':
            return <AwxRecentInventoriesCard key={resource.id} />;
          default:
            return <></>;
        }
      })}
    </PageDashboard>
  );
}

export interface IAwxDashboardData {
  inventories: {
    url: string;
    total: number;
    total_with_inventory_source: number;
    job_failed: number;
    inventory_failed: number;
  };
  inventory_sources: {
    ec2: {
      url: string;
      failures_url: string;
      label: string;
      total: number;
      failed: number;
    };
  };
  groups: {
    url: string;
    total: number;
    inventory_failed: number;
  };
  hosts: {
    url: string;
    failures_url: string;
    total: number;
    failed: number;
  };
  projects: {
    url: string;
    failures_url: string;
    total: number;
    failed: number;
  };
  scm_types: {
    git: {
      url: string;
      label: string;
      failures_url: string;
      total: number;
      failed: number;
    };
    svn: {
      url: string;
      label: string;
      failures_url: string;
      total: number;
      failed: number;
    };
    archive: {
      url: string;
      label: string;
      failures_url: string;
      total: number;
      failed: number;
    };
  };
  users: {
    url: string;
    total: number;
  };
  organizations: {
    url: string;
    total: number;
  };
  teams: {
    url: string;
    total: number;
  };
  credentials: {
    url: string;
    total: number;
  };
  job_templates: {
    url: string;
    total: number;
  };
}
