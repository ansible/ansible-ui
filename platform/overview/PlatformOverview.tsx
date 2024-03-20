import { QuickStartCatalogPage } from '@patternfly/quickstarts';
import {
  Button,
  CardHeader,
  CardTitle,
  Divider,
  Split,
  SplitItem,
  Stack,
} from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PageDashboard, PageDashboardCard, PageHeader, PageLayout } from '../../framework';
import { AwxJobActivityCard } from '../../frontend/awx/overview/cards/AwxJobActivityCard';
import { AwxRecentInventoriesCard } from '../../frontend/awx/overview/cards/AwxRecentInventoriesCard';
import { AwxRecentJobsCard } from '../../frontend/awx/overview/cards/AwxRecentJobsCard';
import { AwxRecentProjectsCard } from '../../frontend/awx/overview/cards/AwxRecentProjectsCard';
import { EdaDecisionEnvironmentsCard } from '../../frontend/eda/overview/cards/EdaDecisionEnvironmentsCard';
import { EdaRuleAuditCard } from '../../frontend/eda/overview/cards/EdaRuleAuditCard';
import { EdaRulebookActivationsCard } from '../../frontend/eda/overview/cards/EdaRulebookActivationsCard';
import { PlatformCountsCard } from './cards/PlatformCountsCard';
import { useManagedPlatformOverview } from './useManagedPlatformOverview';

export function PlatformOverview() {
  const { t } = useTranslation();
  const { openManageDashboard, managedResources } = useManagedPlatformOverview();
  return (
    <PageLayout>
      <PageHeader
        title={t(`Welcome to the Ansible Automation Platform`)}
        description={t(
          'Empower, automate, connect: Unleash possibilities with the Ansible Automation Platform.'
        )}
        controls={
          <Button icon={<CogIcon />} variant="link" onClick={openManageDashboard}>
            Manage view
          </Button>
        }
      />
      <PageDashboard>
        {managedResources.map((resource) => {
          switch (resource.id) {
            case 'quick-starts':
              return (
                <PageDashboardCard
                  key={resource.id}
                  width="xxl"
                  title={t('Quick Starts')}
                  subtitle={t('Learn Ansible automation with hands-on quick starts.')}
                  canCollapse
                >
                  <Divider />
                  <QuickStartCatalogPage showFilter showTitle={false} />
                </PageDashboardCard>
              );
            case 'counts':
              return <PlatformCountsCard key={resource.id} />;
            case 'job_activity':
              return <AwxJobActivityCard key={resource.id} />;
            case 'recent_jobs':
              return <AwxRecentJobsCard key={resource.id} />;
            case 'recent_projects':
              return <AwxRecentProjectsCard key={resource.id} />;
            case 'recent_inventories':
              return <AwxRecentInventoriesCard key={resource.id} />;
            case 'recent-rulebook-activations':
              return <EdaRulebookActivationsCard key={resource.id} />;
            case 'recent-rule-audits':
              return <EdaRuleAuditCard key={resource.id} />;
            case 'recent-decision-environments':
              return <EdaDecisionEnvironmentsCard key={resource.id} />;
            default:
              return <></>;
          }
        })}
      </PageDashboard>
    </PageLayout>
  );
}

export function GalleryCardHeader(props: { icon?: ReactNode; title: string; subtitle: string }) {
  return (
    <CardHeader>
      <Split style={{ width: '100%' }}>
        <SplitItem isFilled>
          <Stack>
            <CardTitle>{props.title}</CardTitle>
            <CardSubtitle>{props.subtitle}</CardSubtitle>
          </Stack>
        </SplitItem>
        <SplitItem>{props.icon}</SplitItem>
      </Split>
    </CardHeader>
  );
}

const CardSubtitle = styled.div`
  opacity: 0.5;
  font-size: smaller;
`;
