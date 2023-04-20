/* eslint-disable i18next/no-literal-string */
import { Banner, Bullseye, PageSection, Spinner } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { PageHeader, PageLayout } from '../../../framework';
import { PageDashboard } from '../../../framework/PageDashboard/PageDashboard';
import { ItemsResponse } from '../../common/crud/Data';
import { useGet } from '../../common/crud/useGet';
import { ExecutionEnvironment } from '../interfaces/ExecutionEnvironment';
import { Job } from '../interfaces/Job';
import { useAwxView } from '../useAwxView';
import { AwxGettingStartedCard } from './cards/AwxGettingStartedCard';
import { AwxHostsCard } from './cards/AwxHostsCard';
import { AwxInventoriesCard } from './cards/AwxInventoriesCard';
import { AwxJobActivityCard } from './cards/AwxJobActivityCard';
import { AwxProjectsCard } from './cards/AwxProjectsCard';
import { AwxRecentJobsCard } from './cards/AwxRecentJobsCard';
import { AwxRecentProjectsCard } from './cards/AwxRecentProjectsCard';

export function AwxDashboard() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const { data: config } = useSWR<IConfigData>(`/api/v2/config/`, (url: string) =>
    fetch(url).then((r) => r.json())
  );
  return (
    <PageLayout>
      {config?.ui_next && (
        <Banner variant="info">
          <Trans>
            <p>
              <InfoCircleIcon /> You are currently viewing a tech preview of the new {product} user
              interface. To return to the original interface, click <a href="/">here</a>.
            </p>
          </Trans>
        </Banner>
      )}
      <PageHeader
        title={t(`Welcome to ${product}`)}
        description={t('Define, operate, scale, and delegate automation across your enterprise.')}
      />
      <DashboardInternal />
    </PageLayout>
  );
}

function DashboardInternal() {
  const executionEnvironments = useExecutionEnvironments();

  const recentJobsView = useAwxView<Job>({
    url: '/api/v2/jobs/',
    disableQueryString: true,
    defaultSort: 'finished',
    defaultSortDirection: 'desc',
  });

  const { data, isLoading } = useSWR<IDashboardData>(`/api/v2/dashboard/`, (url: string) =>
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

  const hasInventory = data.inventories.total !== 0;
  const hasExecutonEnvironment = executionEnvironments.count !== 0;
  const hasJobTemplate = data.job_templates.total !== 0;

  return (
    <PageDashboard>
      <AwxInventoriesCard
        total={data.inventories.total}
        failed={data.inventories.inventory_failed}
      />
      <AwxHostsCard total={data.hosts.total} failed={data.hosts.failed} />
      <AwxProjectsCard total={data.projects.total} failed={data.projects.failed} />
      <AwxGettingStartedCard
        hasInventory={hasInventory}
        hasExecutonEnvironment={hasExecutonEnvironment}
        hasJobTemplate={hasJobTemplate}
      />
      {recentJobsView.itemCount !== 0 && <AwxJobActivityCard />}
      <AwxRecentJobsCard view={recentJobsView} />
      <AwxRecentProjectsCard />
    </PageDashboard>
  );
}

interface IConfigData {
  ui_next: boolean;
}
interface IDashboardData {
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

function useExecutionEnvironments(query?: Record<string, string | number | boolean>) {
  return useAwxItemsResponse<ExecutionEnvironment>({
    url: '/api/v2/execution_environments/',
    query,
  });
}

function useAwxItemsResponse<T>(options: {
  url: string;
  query?: Record<string, string | number | boolean>;
}) {
  const { url, query } = options;
  const response = useGet<ItemsResponse<T>>(url, query);
  return {
    ...response.data,
    loading: !response.data && !response.error,
    refresh: response.refresh,
  };
}
