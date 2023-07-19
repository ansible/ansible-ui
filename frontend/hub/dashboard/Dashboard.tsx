/* eslint-disable i18next/no-literal-string */
import { ButtonVariant, Card, CardBody, DropdownPosition } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDashboard,
  PageHeader,
  PageLayout,
  usePageDialog,
} from '../../../framework';
import { PageDashboardCountBar } from '../../../framework/PageDashboard/PageDashboardCountBar';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { RouteObj } from '../../Routes';
import { useCollections } from '../collections/hooks/useCollections';
import { useExecutionEnvironments } from '../execution-environments/hooks/useExecutionEnvironments';
import { useHubNamespaces } from '../namespaces/hooks/useHubNamespaces';
import { HubGettingStartedCard } from './HubGettingStarted';
import { PageDashboardCarousel } from '../../../framework/PageDashboard/PageDashboardCarousel';
import { ManageView } from './ManageView';

export function HubDashboard() {
  const { t } = useTranslation();
  const namespaces = useHubNamespaces();
  const collections = useCollections();
  const environments = useExecutionEnvironments();
  const [_, setDialog] = usePageDialog();

  if (!namespaces) {
    return <LoadingPage />;
  }

  const hasCollection = (collections?.length ?? 0) > 0;
  const hasExecutionEnvironment = (environments?.length ?? 0) > 0;
  const hasNamespace = (namespaces?.length ?? 0) > 0;

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
                onClick: () => {
                  setDialog(<ManageView />);
                },
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
      </PageDashboard>
    </PageLayout>
  );
}
