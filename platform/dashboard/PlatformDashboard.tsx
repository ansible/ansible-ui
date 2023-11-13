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
import AnsibleContentCollectionsIcon from '../icons/ansible-content-collections.svg';
import AnsibleLightspeedIcon from '../icons/ansible-lightspeed.svg';
import AnsibleRulebookIcon from '../icons/ansible-rulebook.svg';
import AutomationControllerIcon from '../icons/automation-controller.svg';
import AutomationMeshIcon from '../icons/automation-mesh.svg';
import ExecutionEnvironmentBuilderIcon from '../icons/execution-environment-builder.svg';
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
                    subtitle={quickStart.spec.description}
                  />
                  <CardBody>{quickStart.spec.description}</CardBody>
                </GalleryCard>
              ))}
              <GalleryCard>
                <GalleryCardHeader
                  icon={<AnsibleContentCollectionsIcon style={iconStyle} />}
                  title="Browse Automation Content"
                  subtitle="Automation Hub"
                />
                <CardBody>
                  Explore a world of automation content at your fingertips. Discover playbooks,
                  roles, and modules tailored to your needs. Search, filter, and access a rich
                  library of automation resources to streamline your Ansible journey.
                </CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader
                  icon={<ExecutionEnvironmentBuilderIcon style={iconStyle} />}
                  title="Build Environment"
                  subtitle="Automation Hub"
                />
                <CardBody>Build, view, and sync an environment.</CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader
                  icon={<AutomationControllerIcon style={iconStyle} />}
                  title="Inventory"
                  subtitle="Inventory"
                />
                <CardBody>
                  Effortlessly create a new Ansible inventory for managing your infrastructure.
                  Define host details, group hosts logically, and set variables, simplifying your
                  inventory management process.
                </CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader
                  icon={<AutomationControllerIcon style={iconStyle} />}
                  title="Create Project"
                  subtitle="Automation Controller"
                />
                <CardBody>
                  Initiate the creation of a new Ansible project with ease. Define project details,
                  select playbooks, set access controls, and configure variables all in one place,
                  streamlining your automation workflow.
                </CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader
                  icon={<AutomationControllerIcon style={iconStyle} />}
                  title="Create Template"
                  subtitle="Automation Controller"
                />
                <CardBody>
                  Simplify your Ansible automation with ease by setting up job templates. Define
                  playbook, inventory, credentials, and scheduling options all in one place, making
                  it seamless to execute tasks and automate workflows.
                </CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader
                  icon={<AnsibleRulebookIcon style={iconStyle} />}
                  title="Create Rulebook Activation"
                  subtitle="Event-Driven Ansible Controller"
                />
                <CardBody>Create a rulebook activation</CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader
                  icon={<AutomationMeshIcon style={iconStyle} />}
                  title="Automation Mesh"
                  subtitle="Automation Controller"
                />
                <CardBody>
                  Effortlessly configure your Ansible Automation Mesh for seamless integration and
                  orchestration. Define connection details, mesh policies, and service endpoints,
                  ensuring your automation ecosystem is finely tuned for efficient operation.
                </CardBody>
              </GalleryCard>
              <GalleryCard>
                <GalleryCardHeader
                  icon={<AnsibleLightspeedIcon style={iconStyle} />}
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
