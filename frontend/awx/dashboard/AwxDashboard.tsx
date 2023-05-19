/* eslint-disable i18next/no-literal-string */
import {
  Banner,
  Bullseye,
  CardBody,
  PageSection,
  Spinner,
  TextContent,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { PageDashboardCard, PageHeader, PageLayout, usePageDialog } from '../../../framework';
import { PageDashboard } from '../../../framework/PageDashboard/PageDashboard';
import { ItemsResponse } from '../../common/crud/Data';
import { useGet } from '../../common/crud/useGet';
import { useAwxConfig } from '../common/useAwxConfig';
import { ExecutionEnvironment } from '../interfaces/ExecutionEnvironment';
import { Job } from '../interfaces/Job';
import { useAwxView } from '../useAwxView';
import { WelcomeModal } from './WelcomeModal';
import { AwxGettingStartedCard } from './cards/AwxGettingStartedCard';
import { AwxHostsCard } from './cards/AwxHostsCard';
import { AwxInventoriesCard } from './cards/AwxInventoriesCard';
import { AwxJobActivityCard } from './cards/AwxJobActivityCard';
import { AwxProjectsCard } from './cards/AwxProjectsCard';
import { AwxRecentJobsCard } from './cards/AwxRecentJobsCard';
import { AwxRecentProjectsCard } from './cards/AwxRecentProjectsCard';

const HIDE_WELCOME_MESSAGE = 'hide-welcome-message';

export function AwxDashboard() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const config = useAwxConfig();
  const [_, setDialog] = usePageDialog();
  const welcomeMessageSetting = sessionStorage.getItem(HIDE_WELCOME_MESSAGE);
  const hideWelcomeMessage = welcomeMessageSetting ? welcomeMessageSetting === 'true' : false;
  useEffect(() => {
    if (config?.ui_next && !hideWelcomeMessage) {
      setDialog(<WelcomeModal />);
    }
  }, [config?.ui_next, hideWelcomeMessage, setDialog]);

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
        title={t(`Welcome to {{product}}`, { product })}
        description={t('Define, operate, scale, and delegate automation across your enterprise.')}
      />
      <DashboardInternal />
    </PageLayout>
  );
}

function DashboardInternal() {
  const { t } = useTranslation();
  const executionEnvironments = useExecutionEnvironments();

  const recentJobsView = useAwxView<Job>({
    url: '/api/v2/unified_jobs/',
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
      <PageDashboardCard width="xxl" title="About Ansible">
        <CardBody>
          <TextContent>
            <p>
              Ansible is an open-source automation tool that helps you manage and configure your
              computer systems or servers. It allows you to automate tasks such as provisioning,
              configuration management, and application deployment, without requiring any special
              coding skills.
            </p>
          </TextContent>
        </CardBody>
      </PageDashboardCard>
      <PageDashboardCard width="md" title="Playbooks">
        <CardBody>
          <TextContent>
            <p>
              With Ansible, you can define the desired state of your systems in simple, declarative
              YAML files, called playbooks. Playbooks contain a list of tasks that you want to
              perform on your systems, and Ansible takes care of executing those tasks on the target
              systems.
            </p>
          </TextContent>
        </CardBody>
      </PageDashboardCard>
      <PageDashboardCard width="md" title="Connections">
        <CardBody>
          <TextContent>
            <p>
              Ansible works by connecting to the target systems over SSH or WinRM, and then executes
              the defined tasks using various modules that are available in Ansible's library. These
              modules are written in various programming languages, such as Python, Ruby, or Perl,
              and can perform a wide range of tasks, such as installing software, copying files, or
              configuring system settings.
            </p>
          </TextContent>
        </CardBody>
      </PageDashboardCard>
      <PageDashboardCard width="md" title="Agentless">
        <CardBody>
          <TextContent>
            <p>
              One of the key benefits of Ansible is that it is agentless, meaning you don't need to
              install any software or agents on the target systems to use it. This makes it easy to
              get started with Ansible and also helps to reduce the overhead of managing and
              maintaining agents on your systems.
            </p>
          </TextContent>
        </CardBody>
      </PageDashboardCard>
      <AwxGettingStartedCard
        hasInventory={hasInventory}
        hasExecutonEnvironment={hasExecutonEnvironment}
        hasJobTemplate={hasJobTemplate}
      />
      <AwxInventoriesCard
        total={data.inventories.total}
        failed={data.inventories.inventory_failed}
      />
      <AwxHostsCard total={data.hosts.total} failed={data.hosts.failed} />
      <AwxProjectsCard total={data.projects.total} failed={data.projects.failed} />

      {/* <PageDashboardCount
        title={t('Organizations', { count: data.organizations.total })}
        count={data.organizations.total}
      />
      <PageDashboardCount
        title={t('Teams', { count: data.teams.total })}
        count={data.teams.total}
      />
      <PageDashboardCount
        title={t('Users', { count: data.users.total })}
        count={data.users.total}
      /> */}

      {recentJobsView.itemCount !== 0 && <AwxJobActivityCard />}
      <AwxRecentJobsCard view={recentJobsView} />
      <AwxRecentProjectsCard />
    </PageDashboard>
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
