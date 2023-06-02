/* eslint-disable i18next/no-literal-string */
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Gallery,
  PageSection,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, pfSuccess } from '../../../framework';
import { PageDashboardDonutCard } from '../../../framework/PageDashboard/PageDonutChart';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { RouteObj } from '../../Routes';
import { FeaturedCollections } from '../collections/FeaturedCollections';
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
      <PageSection>
        <Stack hasGutter>
          {namespaces.length === 0 && (
            <Card isRounded isFlat>
              <CardHeader>
                <CardTitle>Create a namespace</CardTitle>
              </CardHeader>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>To get started, create a namespace for your organization.</StackItem>
                  <StackItem>
                    <Button>Create namespace</Button>
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          )}
          <FeaturedCollections />
          <Gallery hasGutter minWidths={{ default: '300px' }}>
            <PageDashboardDonutCard
              title={t('Collections')}
              items={[
                { label: t('Collections'), count: collections?.length ?? 0, color: pfSuccess },
              ]}
              to={RouteObj.Collections}
            />
            <PageDashboardDonutCard
              title={t('Namespaces')}
              items={[{ label: t('Namespaces'), count: namespaces?.length ?? 0, color: pfSuccess }]}
              to={RouteObj.Namespaces}
            />
          </Gallery>
        </Stack>
      </PageSection>
    </PageLayout>
  );
}
