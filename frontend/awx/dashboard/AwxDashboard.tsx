/* eslint-disable i18next/no-literal-string */
import { Banner, Bullseye, Button, PageSection, Spinner } from '@patternfly/react-core';
import { CogIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { PageHeader, PageLayout, usePageDialog } from '../../../framework';
import { PageDashboard } from '../../../framework/PageDashboard/PageDashboard';
import { useAwxConfig } from '../common/useAwxConfig';
import { Job } from '../interfaces/Job';
import { useAwxView } from '../useAwxView';
import { WelcomeModal } from './WelcomeModal';
import { AwxJobActivityCard } from './cards/AwxJobActivityCard';
import { AwxRecentJobsCard } from './cards/AwxRecentJobsCard';
import { AwxRecentProjectsCard } from './cards/AwxRecentProjectsCard';
import { AwxProjectsCard } from './cards/AwxProjectsCard';
import { AwxHostsCard } from './cards/AwxHostsCard';
import { AwxInventoriesCard } from './cards/AwxInventoriesCard';
import { AwxRecentInventoriesCard } from './cards/AwxRecentInventoriesCard';
import { useManagedAwxDashboard } from './hooks/useManagedAwxDashboard';

const HIDE_WELCOME_MESSAGE = 'hide-welcome-message';
type Resource = { id: string; name: string; selected: boolean };

export function AwxDashboard() {
  const { t } = useTranslation();
  const { openManageDashboard, managedResources } = useManagedAwxDashboard();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const config = useAwxConfig();
  const [_, setDialog] = usePageDialog();
  const welcomeMessageSetting = localStorage.getItem(HIDE_WELCOME_MESSAGE);
  const hideWelcomeMessage = welcomeMessageSetting ? welcomeMessageSetting === 'true' : false;
  function renderCustomizeControls() {
    return (
      <Button icon={<CogIcon />} variant="link" onClick={openManageDashboard}>
        Manage view
      </Button>
    );
  }
  useEffect(() => {
    if (config?.ui_next && !hideWelcomeMessage) {
      setDialog(<WelcomeModal />);
    }
  }, [config?.ui_next, hideWelcomeMessage, setDialog]);

  return (
    <PageLayout>
      {config?.ui_next && (
        <Banner variant="info">
          <p>
            <InfoCircleIcon />{' '}
            <Trans>
              You are currently viewing a tech preview of the new {{ product }} user interface. To
              return to the original interface, click <a href="/">here</a>.
            </Trans>
          </p>
        </Banner>
      )}
      <PageHeader
        title={t(`Welcome to {{product}}`, { product })}
        description={t('Define, operate, scale, and delegate automation across your enterprise.')}
        controls={renderCustomizeControls()}
      />
      <DashboardInternal managedResources={managedResources} />
    </PageLayout>
  );
}

function DashboardInternal(props: { managedResources: Resource[] }) {
  const { managedResources } = props;
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

  return (
    <PageDashboard>
      {managedResources.map((r: Resource) => {
        if (!r.selected) {
          return <></>;
        }
        switch (true) {
          case r.id === 'recent_job_activity':
            return <AwxJobActivityCard />;
          case r.id === 'project':
            return <AwxProjectsCard total={data.projects.total} failed={data.projects.failed} />;
          case r.id === 'host':
            return <AwxHostsCard total={data.hosts.total} failed={data.hosts.failed} />;
          case r.id === 'inventory':
            return (
              <AwxInventoriesCard
                total={data.inventories.total}
                failed={data.inventories.inventory_failed}
              />
            );
          case r.id === 'recent_jobs':
            return <AwxRecentJobsCard view={recentJobsView} />;
          case r.id === 'recent_projects':
            return <AwxRecentProjectsCard />;
          case r.id === 'recent_inventories':
            return <AwxRecentInventoriesCard />;
          default:
            return <></>;
        }
      })}
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
