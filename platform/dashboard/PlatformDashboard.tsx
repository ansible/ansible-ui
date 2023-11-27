/* eslint-disable i18next/no-literal-string */
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
import { quickStarts } from './quickstarts/quickstarts';
// import EventDrivenControllerIcon from '../icons/event-driver-controller.svg';
// import AutomationExentutionEnvironmnentIcon from '../icons//automation-execution-environment.svg';

export function PlatformDashboard() {
  const { t } = useTranslation();
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
          title={t('Getting started with the Ansible Automation Platform')}
          width="xxl"
        >
          <CardBody>
            <Gallery hasGutter minWidths={{ default: '390px' }}>
              {quickStarts.map((quickStart) => (
                <GalleryCard key={quickStart.metadata.name}>
                  <GalleryCardHeader
                    icon={quickStart.spec.icon}
                    title={quickStart.spec.displayName}
                    subtitle={quickStart.spec.subtitle}
                  />
                  <CardBody>{quickStart.spec.description}</CardBody>
                </GalleryCard>
              ))}
            </Gallery>
          </CardBody>
        </PageDashboardCard>
        {/* <PageDashboardCard title={t('Execution Environments')} width="xxl">
          <CardBody>Something goes here.</CardBody>
        </PageDashboardCard> */}
        {/* <AwxCountsCard /> */}
        <AwxJobActivityCard />
        <AwxRecentJobsCard />
        <AwxRecentProjectsCard />
        <AwxRecentInventoriesCard />
        <EdaRulebookActivationsCard />
      </PageDashboard>
    </PageLayout>
  );
}

export function GalleryCard(props: { children: ReactNode }) {
  return (
    <Card
      isSelectable
      isFlat
      isRounded
      style={{ backgroundColor: 'var(--pf-global--BackgroundColor--300)' }}
    >
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

const iconStyle = { width: 38, height: 38 };
