/* eslint-disable i18next/no-literal-string */
import { ButtonVariant, DropdownPosition } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDashboard,
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
import { useManageHubDashboard } from './useManageHubDashboard';
import { useState } from 'react';
import { CategorizedCollections } from './CollectionCategory';
import { useCategorizeCollections } from './hooks/useCategorizeCollections';
import { CollectionCategories } from './CollectionCategories';

export function HubDashboard() {
  const { t } = useTranslation();
  const namespaces = useHubNamespaces();
  const collections = useCollections();
  const environments = useExecutionEnvironments();

  const { openManageDashboard, managedCategories } = useManageHubDashboard();

  /** Data for collection category carousels */
  const [categorizedCollections, setCategorizedCollections] = useState<CategorizedCollections>({});

  /** Retrieve and set categories of collections and map categories to collections */
  useCategorizeCollections(managedCategories, setCategorizedCollections);

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
                onClick: openManageDashboard,
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
        {managedCategories.length ? (
          <CollectionCategories
            categories={managedCategories}
            categorizedCollections={categorizedCollections}
          />
        ) : null}
      </PageDashboard>
    </PageLayout>
  );
}
