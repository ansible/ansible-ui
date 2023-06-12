/* eslint-disable i18next/no-literal-string */
import { ButtonVariant, Card, CardBody, DropdownPosition, Gallery } from '@patternfly/react-core';
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
import { PageCarousel } from '../../../framework/PageCarousel/PageCarousel';

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
        <PageDashboardCard title="Featured Collections" linkText="Goto Collections" width="xxl">
          <CardBody>
            <Gallery hasGutter>
              <Card isRounded isFlat>
                <CardBody>Card</CardBody>
              </Card>
              <Card isRounded isFlat>
                <CardBody>Card</CardBody>
              </Card>
              <Card isRounded isFlat>
                <CardBody>Card</CardBody>
              </Card>
            </Gallery>
          </CardBody>
        </PageDashboardCard>
        <PageDashboardCard title="My Collections" linkText="Goto Collections" width="xxl">
          <CardBody>
            <Gallery hasGutter>
              <Card isRounded isFlat>
                <CardBody>Card</CardBody>
              </Card>
              <Card isRounded isFlat>
                <CardBody>Card</CardBody>
              </Card>
              <Card isRounded isFlat>
                <CardBody>Card</CardBody>
              </Card>
            </Gallery>
          </CardBody>
        </PageDashboardCard>
        <PageDashboardCard title="Carousel Dashboard Card" linkText="Go to Collections" width="xxl">
          <CardBody>
            <PageCarousel>
              <Card isRounded isFlat>
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
            </PageCarousel>
          </CardBody>
        </PageDashboardCard>
      </PageDashboard>
    </PageLayout>
  );
}
