/* eslint-disable i18next/no-literal-string */
import { ButtonVariant, DropdownPosition } from '@patternfly/react-core';
import { CogIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDashboard,
  PageHeader,
  PageLayout,
} from '../../../framework';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { useHubNamespaces } from '../namespaces/hooks/useHubNamespaces';
import { useManageHubDashboard } from './useManageHubDashboard';
import { useState } from 'react';
import { CategorizedCollections } from './CollectionCategory';
import { useCategorizeCollections } from './hooks/useCategorizeCollections';
import { CollectionCategoryCarousel } from './CollectionCategories';

export function HubDashboard() {
  const { t } = useTranslation();
  const namespaces = useHubNamespaces();

  const { openManageDashboard, managedCategories } = useManageHubDashboard();

  /** Data for collection category carousels */
  const [categorizedCollections, setCategorizedCollections] = useState<CategorizedCollections>({});

  /** Retrieve and set categories of collections and map categories to collections */
  useCategorizeCollections(managedCategories, setCategorizedCollections);

  if (!namespaces) {
    return <LoadingPage />;
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Welcome to Automation Hub')}
        description={t(
          'Find and use content that is supported by Red Hat and our partners to deliver reassurance for the most demanding environments. Get started by exploring the options below.'
        )}
        headerActions={
          <PageActions
            actions={[
              {
                label: 'Build Environment',
                icon: PlusCircleIcon,
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
        {managedCategories.map((category) =>
          categorizedCollections[category.id] ? (
            <CollectionCategoryCarousel
              key={category.id}
              category={category.id}
              collections={categorizedCollections[category.id]}
            />
          ) : null
        )}
      </PageDashboard>
    </PageLayout>
  );
}
