/* eslint-disable i18next/no-literal-string */
import { Card, CardBody, CardHeader, CardTitle, Gallery, Stack } from '@patternfly/react-core';
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
            <Gallery hasGutter>
              <Card isFlat isRounded>
                <DashboardCardHeader
                  icon={<AnsibleContentCollectionsIcon style={{ width: 38, height: 38 }} />}
                  title="Browse Automation Content"
                  subtitle="Automation Hub"
                />
                <CardBody>
                  Browse Automation Hub and discover content and somthing on a second line.
                </CardBody>
              </Card>
              <Card isFlat isRounded>
                <DashboardCardHeader
                  icon={<ExecutionEnvironmentBuilderIcon style={{ width: 38, height: 38 }} />}
                  title="Build Environment"
                  subtitle="Automation Hub"
                />
                <CardBody>Build, view, and sync an environment.</CardBody>
              </Card>
              <Card isFlat isRounded>
                <DashboardCardHeader
                  icon={<AutomationControllerIcon style={{ width: 38, height: 38 }} />}
                  title="Inventory"
                  subtitle="Inventory"
                />
                <CardBody>Create of view an inventory.</CardBody>
              </Card>
              <Card isFlat isRounded>
                <DashboardCardHeader
                  icon={<AutomationControllerIcon style={{ width: 38, height: 38 }} />}
                  title="Create Project"
                  subtitle="Automation Controller"
                />
                <CardBody>Create a project</CardBody>
              </Card>
              <Card isFlat isRounded>
                <DashboardCardHeader
                  icon={<AutomationControllerIcon style={{ width: 38, height: 38 }} />}
                  title="Create Template"
                  subtitle="Automation Controller"
                />
                <CardBody>Create a template</CardBody>
              </Card>
              <Card isFlat isRounded>
                <DashboardCardHeader
                  icon={<AnsibleRulebookIcon style={{ width: 38, height: 38 }} />}
                  title="Create Rulebook Activation"
                  subtitle="Event-Driven Ansible Controller"
                />
                <CardBody>Create a rulebook activation</CardBody>
              </Card>
              <Card isFlat isRounded>
                <DashboardCardHeader
                  icon={<AutomationMeshIcon style={{ width: 38, height: 38 }} />}
                  title="Automation Mesh"
                  subtitle="Automation Controller"
                />
                <CardBody>Something goes here.</CardBody>
              </Card>
              <Card isFlat isRounded>
                <DashboardCardHeader
                  icon={<AnsibleLightspeedIcon style={{ width: 38, height: 38 }} />}
                  title="Ansible Lightspeed"
                  subtitle="Ansible Lightspeed with Watson Code Assistant"
                />
                <CardBody>Something goes here.</CardBody>
              </Card>
            </Gallery>
          </CardBody>
        </PageDashboardCard>
        <PageDashboardCard title={t('Execution Environments')} width="xxl">
          <CardBody>Something goes here.</CardBody>
        </PageDashboardCard>
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

function DashboardCardHeader(props: { icon?: ReactNode; title: string; subtitle: string }) {
  return (
    <CardHeader>
      <Stack>
        <div>{props.icon}</div>
        <Stack>
          <CardTitle>{props.title}</CardTitle>
          <CardSubtitle>{props.subtitle}</CardSubtitle>
        </Stack>
      </Stack>
    </CardHeader>
  );
}

const CardSubtitle = styled.div`
  opacity: 0.5;
  font-size: smaller;
`;
