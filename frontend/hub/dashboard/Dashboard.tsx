/* eslint-disable i18next/no-literal-string */
import { ButtonVariant, Card, CardBody, DropdownPosition } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDashboard,
  PageDashboardCard,
  PageHeader,
  PageLayout,
} from '../../../framework';
import { PageDashboardCountBar } from '../../../framework/PageDashboard/PageDashboardCountBar';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { RouteObj } from '../../Routes';
import { useCollections } from '../collections/hooks/useCollections';
import { useExecutionEnvironments } from '../execution-environments/hooks/useExecutionEnvironments';
import { useHubNamespaces } from '../namespaces/hooks/useHubNamespaces';
import { HubGettingStartedCard } from './HubGettingStarted';
import { PageDashboardCarousel } from '../../../framework/PageDashboard/PageDashboardCarousel';
import { ReorderItems } from '../../../framework/components/ReorderItems';

export function HubDashboard() {
  const { t } = useTranslation();
  const namespaces = useHubNamespaces();
  const collections = useCollections();
  const environments = useExecutionEnvironments();

  if (!namespaces) {
    return <LoadingPage />;
  }

  const hasCollection = (collections?.length ?? 0) > 0;
  const hasExecutionEnvironment = (environments?.length ?? 0) > 0;
  const hasNamespace = (namespaces?.length ?? 0) > 0;

  type Item = { [key: string]: string };
  const columns = [
    {
      header: 'IDs',
      cell: (item: Item) => item.id,
    },
    {
      header: 'Repositories',
      cell: (item: Item) => item.repository,
    },
    {
      header: 'Branches',
      cell: (item: Item) => item.branch,
    },
  ];
  const items: Item[] = [
    {
      id: 'row1',
      repository: 'one',
      branch: 'two',
    },
    {
      id: 'row2',
      repository: 'one -2',
      branch: 'two',
    },
    {
      id: 'row3',
      repository: 'one - 3',
      branch: 'two - 3',
    },
    {
      id: 'row4',
      repository: 'one - 4',
      branch: 'two - 4',
    },
    {
      id: 'row5',
      repository: 'one - 5',
      branch: 'two - 5',
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title={t('Welcome to Galaxy')}
        description={t('Discover, publish, and manage your Ansible collections.')}
        headerActions={
          <PageActions
            actions={[
              {
                label: 'Build Environment',
                type: PageActionType.Button,
                variant: ButtonVariant.primary,
                selection: PageActionSelection.None,
                isPinned: true,
                onClick: () => alert('TODO'),
              },
              {
                icon: CogIcon,
                label: 'Manage View',
                type: PageActionType.Button,
                selection: PageActionSelection.None,
                onClick: () => alert('TODO'),
              },
            ]}
            position={DropdownPosition.right}
          />
        }
      />
      <PageDashboard>
        <HubGettingStartedCard
          hasCollection={hasCollection}
          hasExecutionEnvironment={hasExecutionEnvironment}
          hasNamespace={hasNamespace}
        />
        <PageDashboardCountBar
          counts={[
            { title: t('Collections'), count: collections?.length ?? 0, to: RouteObj.Collections },
            { title: t('Namespaces'), count: namespaces?.length ?? 0, to: RouteObj.Namespaces },
            {
              title: t('Environments'),
              count: environments?.length ?? 0,
              to: RouteObj.HubExecutionEnvironments,
            },
          ]}
        />
        <PageDashboardCarousel
          title="Featured Collections"
          linkText="Go to Collections"
          width="xxl"
        >
          <Card isFlat>
            <CardBody>Card 1</CardBody>
          </Card>
          <Card isRounded isFlat>
            <CardBody>Card 2</CardBody>
          </Card>
          <Card isRounded isFlat>
            <CardBody>Card 3</CardBody>
          </Card>
          <Card isRounded isFlat>
            <CardBody>Card 4</CardBody>
          </Card>
          <Card isRounded isFlat>
            <CardBody>Card 5</CardBody>
          </Card>
          <Card isRounded isFlat>
            <CardBody>Card 6</CardBody>
          </Card>
          <Card isRounded isFlat>
            <CardBody>Card 7</CardBody>
          </Card>
          <Card isRounded isFlat>
            <CardBody>Card 8</CardBody>
          </Card>
          <Card isRounded isFlat>
            <CardBody>Card 9</CardBody>
          </Card>
          <Card isRounded isFlat>
            <CardBody>Card 10</CardBody>
          </Card>
          <Card isRounded isFlat>
            <CardBody>Card 11</CardBody>
          </Card>
        </PageDashboardCarousel>
        <PageDashboardCarousel title="My Collections" linkText="Go to Collections" width="xxl">
          <Card isFlat>
            <CardBody>Card 1</CardBody>
          </Card>
          <Card isRounded isFlat>
            <CardBody>Card 2</CardBody>
          </Card>
          <Card isRounded isFlat>
            <CardBody>Card 3</CardBody>
          </Card>
        </PageDashboardCarousel>
        <PageDashboardCard title="Reorder" width="xxl">
          <CardBody>
            <ReorderItems columns={columns} items={items} />
          </CardBody>
        </PageDashboardCard>
      </PageDashboard>
    </PageLayout>
  );
}
