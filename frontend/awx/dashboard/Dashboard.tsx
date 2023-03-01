/* eslint-disable i18next/no-literal-string */
import { Banner, Bullseye, PageSection, Spinner, Stack } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { PageHeader, PageLayout, pfDanger, pfSuccess, Scrollable } from '../../../framework';
import { PageGrid } from '../../../framework/components/PageGrid';
import { PageDashboardDonutCard } from '../../../framework/PageDashboard/PageDonutChart';
import { ItemsResponse, useGet2 } from '../../Data';
import { RouteObj } from '../../Routes';
import { ExecutionEnvironment } from '../interfaces/ExecutionEnvironment';
import { Host } from '../interfaces/Host';
import { Inventory } from '../interfaces/Inventory';
import { Project } from '../interfaces/Project';
import { UnifiedJob } from '../interfaces/UnifiedJob';
import { DashboardJobsCard } from './cards/DashboardJobs';
import { OnboardExecutionEnvironments } from './cards/OnboardExecutionEnvironments';
import { OnboardInventories } from './cards/OnboardInventories';

export default function Dashboard() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <Banner variant="info">
        <Trans>
          <p>
            <InfoCircleIcon /> You are currently viewing a tech preview of the new Ansible
            Automation Platform user interface. To return to the original interface, click{' '}
            <a href="/">here</a>.
          </p>
        </Trans>
      </Banner>
      <PageHeader
        title={t('Welcome to AWX')}
        description={t('Define, operate, scale, and delegate automation across your enterprise.')}
      />
      <DashboardInternal />
    </PageLayout>
  );
}

function DashboardInternal() {
  const { t } = useTranslation();
  const executionEnvironments = useExecutionEnvironments();

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

  return (
    <>
      <Scrollable>
        <PageSection isWidthLimited>
          <Stack hasGutter>
            <OnboardExecutionEnvironments count={executionEnvironments.count} />
            <OnboardInventories count={data.inventories.total} />
            {/* <OnboardJobs count={data.???.count} /> */}
            <PageGrid size={300}>
              <PageDashboardDonutCard
                title={t('Inventories')}
                to={RouteObj.Inventories}
                items={[
                  {
                    label: t('Ready'),
                    count: data.inventories.total - data.inventories.inventory_failed,
                    color: pfSuccess,
                  },
                  {
                    label: t('Sync failures'),
                    count: data.inventories.inventory_failed,
                    color: pfSuccess,
                  },
                ]}
              />
              <PageDashboardDonutCard
                title={t('Hosts')}
                to={RouteObj.Hosts}
                items={[
                  {
                    label: t('Ready'),
                    count: data.hosts.total - data.hosts.failed,
                    color: pfSuccess,
                  },
                  {
                    label: t('Failed'),
                    count: data.hosts.failed,
                    color: pfDanger,
                  },
                ]}
              />
              <PageDashboardDonutCard
                title={t('Projects')}
                to={RouteObj.Projects}
                items={[
                  {
                    label: t('Ready'),
                    count: data.projects.total - data.projects.failed,
                    color: pfSuccess,
                  },
                  {
                    label: t('Sync failures'),
                    count: data.projects.failed,
                    color: pfDanger,
                  },
                ]}
              />
            </PageGrid>
            <DashboardJobsCard />
          </Stack>
        </PageSection>
      </Scrollable>
    </>
  );
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
    total: 3;
  };
}

function useExecutionEnvironments(query?: Record<string, string | number | boolean>) {
  const { t } = useTranslation();
  return useAwxItemsResponse<ExecutionEnvironment>({
    url: '/api/v2/execution_environments/',
    query,
    errorTitle: t('Error querying execution environments.'),
  });
}

function useInventories(query?: Record<string, string | number | boolean>) {
  const { t } = useTranslation();
  return useAwxItemsResponse<Inventory>({
    url: '/api/v2/inventories/',
    query,
    errorTitle: t('Error querying inventories.'),
  });
}

function useHosts(query?: Record<string, string | number | boolean>) {
  const { t } = useTranslation();
  return useAwxItemsResponse<Host>({
    url: '/api/v2/hosts/',
    query,
    errorTitle: t('Error querying hosts.'),
  });
}

function useProjects(query?: Record<string, string | number | boolean>) {
  const { t } = useTranslation();
  return useAwxItemsResponse<Project>({
    url: '/api/v2/projects/',
    query,
    errorTitle: t('Error querying projects.'),
  });
}

function useUnifiedJobs(query?: Record<string, string | number | boolean>) {
  const { t } = useTranslation();
  return useAwxItemsResponse<UnifiedJob>({
    url: '/api/v2/unified_jobs/',
    query,
    errorTitle: t('Error querying unified jobs.'),
  });
}

function useAwxItemsResponse<T>(options: {
  url: string;
  query?: Record<string, string | number | boolean>;
  errorTitle?: string;
}) {
  const { url, query, errorTitle } = options;
  const response = useGet2<ItemsResponse<T>>({ url, query, errorTitle });
  const refresh = useCallback(() => void response.mutate(), [response]);
  return { ...response.data, loading: !response.data && !response.error, refresh };
}
