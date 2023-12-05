import { QuickStartCatalogPage } from '@patternfly/quickstarts';
import { CardHeader, CardTitle, Divider, Split, SplitItem, Stack } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PageDashboard, PageDashboardCard, PageHeader, PageLayout } from '../../framework';
import { AwxJobActivityCard } from '../../frontend/awx/dashboard/cards/AwxJobActivityCard';
import { AwxRecentInventoriesCard } from '../../frontend/awx/dashboard/cards/AwxRecentInventoriesCard';
import { AwxRecentJobsCard } from '../../frontend/awx/dashboard/cards/AwxRecentJobsCard';
import { AwxRecentProjectsCard } from '../../frontend/awx/dashboard/cards/AwxRecentProjectsCard';
import { EdaRulebookActivationsCard } from '../../frontend/eda/dashboard/cards/EdaRulebookActivationsCard';
import { useHasAwx, useHasEda } from '../PlatformProvider';

export function PlatformDashboard() {
  const { t } = useTranslation();
  const hasAwx = useHasAwx();
  const hasEda = useHasEda();
  return (
    <PageLayout>
      <PageHeader
        title={t(`Welcome to the Ansible Automation Platform`)}
        description={t(
          'Empower, Automate, Connect: Unleash Possibilities with the Ansible Automation Platform.'
        )}
      />
      <PageDashboard>
        <PageDashboardCard
          width="xxl"
          title={t('Quick starts')}
          subtitle={t('Learn Ansible automation with hands-on quickstarts.')}
          canCollapse
        >
          <Divider />
          <QuickStartCatalogPage showFilter showTitle={false} />
        </PageDashboardCard>
        {hasAwx && <AwxJobActivityCard />}
        {hasAwx && <AwxRecentJobsCard />}
        {hasAwx && <AwxRecentProjectsCard />}
        {hasAwx && <AwxRecentInventoriesCard />}
        {hasEda && <EdaRulebookActivationsCard />}
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
