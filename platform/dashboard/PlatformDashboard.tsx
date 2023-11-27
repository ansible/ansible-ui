import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Gallery,
  Split,
  SplitItem,
  Stack,
} from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PageDashboard, PageDashboardCard, PageHeader, PageLayout } from '../../framework';
import { AwxJobActivityCard } from '../../frontend/awx/dashboard/cards/AwxJobActivityCard';
import { AwxRecentInventoriesCard } from '../../frontend/awx/dashboard/cards/AwxRecentInventoriesCard';
import { AwxRecentJobsCard } from '../../frontend/awx/dashboard/cards/AwxRecentJobsCard';
import { AwxRecentProjectsCard } from '../../frontend/awx/dashboard/cards/AwxRecentProjectsCard';
import { EdaRulebookActivationsCard } from '../../frontend/eda/dashboard/cards/EdaRulebookActivationsCard';
import { useHasController, useHasEda } from '../PlatformProvider';
import { useQuickStarts } from './quickstarts/QuickStartProvider';

export function PlatformDashboard() {
  const { t } = useTranslation();
  const hasAwx = useHasController();
  const hasEda = useHasEda();
  const { platformQuickStarts, setActiveQuickStartID } = useQuickStarts();
  return (
    <PageLayout>
      <PageHeader
        title={t(`Welcome to the Ansible Automation Platform`)}
        description={t(
          'Empower, Automate, Connect: Unleash Possibilities with the Ansible Automation Platform.'
        )}
      />
      <PageDashboard>
        <PageDashboardCard title={t('Ansible Automation Platform Quick Starts')} width="xxl">
          <CardBody>
            <Gallery hasGutter minWidths={{ default: '390px' }}>
              {platformQuickStarts.map((platformQuickStart) => (
                <GalleryCard
                  key={platformQuickStart.id}
                  onClick={() => setActiveQuickStartID(platformQuickStart.id)}
                >
                  <GalleryCardHeader
                    // icon={platformQuickStart}
                    title={platformQuickStart.name}
                    subtitle={platformQuickStart.subtitle}
                  />
                  <CardBody>{platformQuickStart.description}</CardBody>
                </GalleryCard>
              ))}
            </Gallery>
          </CardBody>
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

export function GalleryCard(props: { children: ReactNode; onClick?: () => void }) {
  return (
    <Card isSelectable isFlat isRounded className="bg-lighten-2" onClick={props.onClick}>
      {props.children}
    </Card>
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
