/* eslint-disable i18next/no-literal-string */
import { Banner, Bullseye, PageSection, Spinner, Stack } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { PageHeader, PageLayout, Scrollable } from '../../../framework';
import { PageGrid } from '../../../framework/components/PageGrid';
import { ItemsResponse, useGet2 } from '../../Data';
import { ExecutionEnvironment } from '../interfaces/ExecutionEnvironment';
import { Host } from '../interfaces/Host';
import { Inventory } from '../interfaces/Inventory';
import { Project } from '../interfaces/Project';
import { UnifiedJob } from '../interfaces/UnifiedJob';
import { DashboardExecutionEnvironments } from './cards/DashboardExecutionEnvironments';
import { DashboardHosts } from './cards/DashboardHosts';
import { DashboardInventories } from './cards/DashboardInventories';
import { DashboardJobsCard } from './cards/DashboardJobs';
import { DashboardProjects } from './cards/DashboardProjects';
import { OnboardExecutionEnvironments } from './cards/OnboardExecutionEnvironments';
import { OnboardInventories } from './cards/OnboardInventories';
import { OnboardJobs } from './cards/OnboardJobs';

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
  const projects = useProjects();
  const executionEnvironments = useExecutionEnvironments();
  const inventories = useInventories();
  const hosts = useHosts();
  const unifiedJobs = useUnifiedJobs({ page_size: 1 });

  if (
    executionEnvironments.loading ||
    inventories.loading ||
    projects.loading ||
    hosts.loading ||
    unifiedJobs.loading
  ) {
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
            <OnboardInventories count={inventories.count} />
            <OnboardJobs count={unifiedJobs.count} />
            <PageGrid size={300}>
              <DashboardInventories inventories={inventories} />
              <DashboardHosts hosts={hosts} />
              <DashboardProjects projects={projects} />
              <DashboardExecutionEnvironments executionEnvironments={executionEnvironments} />
            </PageGrid>
            <DashboardJobsCard />
          </Stack>
        </PageSection>
      </Scrollable>
    </>
  );
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
