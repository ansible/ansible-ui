import { PageDashboard, PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { AwxJobActivityCard } from '@ansible/awx-ui/overview/cards/AwxJobActivityCard';
import { AwxRecentInventoriesCard } from '@ansible/awx-ui/overview/cards/AwxRecentInventoriesCard';
import { AwxRecentJobsCard } from '@ansible/awx-ui/overview/cards/AwxRecentJobsCard';
import { AwxRecentProjectsCard } from '@ansible/awx-ui/overview/cards/AwxRecentProjectsCard';
import { EdaDecisionEnvironmentsCard } from '@ansible/eda-ui/overview/cards/EdaDecisionEnvironmentsCard';
import { EdaRuleAuditCard } from '@ansible/eda-ui/overview/cards/EdaRuleAuditCard';
import { EdaRulebookActivationsCard } from '@ansible/eda-ui/overview/cards/EdaRulebookActivationsCard';
import { Button, CardHeader, CardTitle, Split, SplitItem, Stack } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useHasAwxService, useHasEdaService } from '../main/GatewayServices';
import { PlatformCountsCard } from './cards/PlatformCountsCard';
import { useManagedPlatformOverview } from './useManagedPlatformOverview';

export function PlatformOverview() {
  const { t } = useTranslation();
  const { openManageDashboard, managedResources } = useManagedPlatformOverview();
  const awxService = useHasAwxService();
  const edaService = useHasEdaService();

  // Check for social auth redirect URL in sessionStorage
  useEffect(() => {
    const storedRedirectUrl = sessionStorage.getItem('social_auth_redirect_url');
    if (
      storedRedirectUrl &&
      storedRedirectUrl !== '' &&
      storedRedirectUrl !== '/' &&
      storedRedirectUrl !== '/overview'
    ) {
      // Clear the stored URL to prevent repeated redirects
      sessionStorage.removeItem('social_auth_redirect_url');
      // Redirect to the stored URL
      window.location.href = storedRedirectUrl;
    }
  }, []);
  return (
    <PageLayout>
      <PageHeader
        title={t(`Welcome to Ansible`)}
        description={t('Empower, automate, connect: Unleash possibilities with Ansible.')}
        controls={
          <Button icon={<CogIcon />} variant="link" onClick={openManageDashboard}>
            Manage view
          </Button>
        }
      />
      {/* Service detection elements for tests */}
      {awxService && <div data-testid="platform-awx" style={{ display: 'none' }} />}
      {edaService && <div data-testid="platform-eda" style={{ display: 'none' }} />}
      <PageDashboard>
        {managedResources
          .filter((resource) => {
            switch (resource.id) {
              case 'counts':
              case 'job_activity':
              case 'recent_jobs':
              case 'recent_projects':
              case 'recent_inventories':
                return !!awxService;
              case 'recent-rulebook-activations':
              case 'recent-rule-audits':
              case 'recent-decision-environments':
                return !!edaService;
            }
            return true;
          })
          .map((resource) => {
            switch (resource.id) {
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
                return null;
            }
          })}
      </PageDashboard>
    </PageLayout>
  );
}

export function GalleryCardHeader(
  props: Readonly<{ icon?: ReactNode; title: string; subtitle: string }>
) {
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
