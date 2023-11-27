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
import { useHasController, useHasEda } from '../PlatformProvider';

export function PlatformDashboard() {
  const { t } = useTranslation();
  const hasAwx = useHasController();
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
          title={t('Getting started with the Ansible Automation Platform')}
          width="xxl"
        >
          <CardBody>
            <Gallery hasGutter minWidths={{ default: '390px' }}>
              <GalleryCard>
                <GalleryCardHeader title="Browse Automation Content" subtitle="Automation Hub" />
                <CardBody>
                  Explore a world of automation content at your fingertips. Discover playbooks,
                  roles, and modules tailored to your needs. Search, filter, and access a rich
                  library of automation resources to streamline your Ansible journey.
                </CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader title="Build Environment" subtitle="Automation Hub" />
                <CardBody>Build, view, and sync an environment.</CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader title="Inventory" subtitle="Inventory" />
                <CardBody>
                  Effortlessly create a new Ansible inventory for managing your infrastructure.
                  Define host details, group hosts logically, and set variables, simplifying your
                  inventory management process.
                </CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader title="Create Project" subtitle="Automation Controller" />
                <CardBody>
                  Initiate the creation of a new Ansible project with ease. Define project details,
                  select playbooks, set access controls, and configure variables all in one place,
                  streamlining your automation workflow.
                </CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader title="Create Template" subtitle="Automation Controller" />
                <CardBody>
                  Simplify your Ansible automation with ease by setting up job templates. Define
                  playbook, inventory, credentials, and scheduling options all in one place, making
                  it seamless to execute tasks and automate workflows.
                </CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader
                  title="Create Rulebook Activation"
                  subtitle="Event-Driven Ansible Controller"
                />
                <CardBody>Create a rulebook activation</CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader title="Automation Mesh" subtitle="Automation Controller" />
                <CardBody>
                  Effortlessly configure your Ansible Automation Mesh for seamless integration and
                  orchestration. Define connection details, mesh policies, and service endpoints,
                  ensuring your automation ecosystem is finely tuned for efficient operation.
                </CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader
                  title="Ansible Lightspeed"
                  subtitle="Ansible Lightspeed with Watson Code Assistant"
                />
                <CardBody>Something goes here.</CardBody>
              </GalleryCard>
            </Gallery>
          </CardBody>
        </PageDashboardCard>
        {/* <PageDashboardCard title={t('Execution Environments')} width="xxl">
          <CardBody>Something goes here.</CardBody>
        </PageDashboardCard> */}
        {/* <AwxCountsCard /> */}
        {hasAwx && <AwxJobActivityCard />}
        {hasAwx && <AwxRecentJobsCard />}
        {hasAwx && <AwxRecentProjectsCard />}
        {hasAwx && <AwxRecentInventoriesCard />}
        {hasEda && <EdaRulebookActivationsCard />}
      </PageDashboard>
    </PageLayout>
  );
}

export function GalleryCard(props: { children: ReactNode }) {
  return (
    <Card isSelectable isFlat isRounded className="bg-lighten-2">
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
