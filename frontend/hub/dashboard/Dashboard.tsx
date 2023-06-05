/* eslint-disable i18next/no-literal-string */
import { Card, CardBody, Gallery } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  PageDashboard,
  PageDashboardCard,
  PageHeader,
  PageLayout,
  pfSuccess,
} from '../../../framework';
import { PageDashboardDonutCard } from '../../../framework/PageDashboard/PageDonutChart';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { RouteObj } from '../../Routes';
import { useCollections } from '../collections/hooks/useCollections';
import { useHubNamespaces } from '../namespaces/hooks/useHubNamespaces';

export function HubDashboard() {
  const { t } = useTranslation();
  const namespaces = useHubNamespaces();
  const collections = useCollections();

  if (!namespaces) {
    return <LoadingPage />;
  }

  return (
    <PageLayout>
      <PageHeader
        title="Welcome to Galaxy"
        description="Discover, publish, and manage your Ansible collections."
      />
      <PageDashboard>
        <PageDashboardCard title="Featured Collections" linkText="Goto Collections" width="xxl">
          <CardBody>
            <Gallery hasGutter>
              <Card isRounded isFlat>
                <CardBody>Card 1</CardBody>
              </Card>
              <Card isRounded isFlat>
                <CardBody>Card 1</CardBody>
              </Card>
            </Gallery>
          </CardBody>
        </PageDashboardCard>
        <PageDashboardDonutCard
          title={t('Collections')}
          items={[{ label: t('Collections'), count: collections?.length ?? 0, color: pfSuccess }]}
          linkText={t('Go to Collections')}
          to={RouteObj.Collections}
        />
        <PageDashboardDonutCard
          title={t('Namespaces')}
          linkText={t('Go to Namespaces')}
          items={[{ label: t('Namespaces'), count: namespaces?.length ?? 0, color: pfSuccess }]}
          to={RouteObj.Namespaces}
        />
      </PageDashboard>
    </PageLayout>
  );
}
