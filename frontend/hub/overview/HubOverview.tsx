/* eslint-disable i18next/no-literal-string */
import { Banner, Bullseye, Button, ButtonVariant, Flex, FlexItem } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { CogIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDashboard,
  PageHeader,
  PageLayout,
} from '../../../framework';
import { EmptyStateNoData } from '../../../framework/components/EmptyStateNoData';
import { ExternalLink } from '../common/ExternalLink';
import { CollectionCategoryCarousel } from './CollectionCategories';
import { CategorizedCollections } from './CollectionCategory';
import { useCategorizeCollections } from './hooks/useCategorizeCollections';
import { useManageHubDashboard } from './useManageHubDashboard';

export function HubOverview() {
  const { t } = useTranslation();

  const { openManageDashboard, managedCategories } = useManageHubDashboard();

  /** Data for collection category carousels */
  const [categorizedCollections, setCategorizedCollections] = useState<CategorizedCollections>({});

  /** Retrieve and set categories of collections and map categories to collections */
  useCategorizeCollections(managedCategories, setCategorizedCollections);

  return (
    <PageLayout>
      <Banner variant="blue">
        <Flex spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <InfoCircleIcon />
          </FlexItem>
          <FlexItem>
            <Trans>
              You are currently viewing a tech preview of the new Ansible Automation Platform user
              interface. To return to the original interface, click{' '}
              <ExternalLink href="/ui/">here</ExternalLink>.
            </Trans>
          </FlexItem>
        </Flex>
      </Banner>
      <PageHeader
        title={t('Welcome to Automation Hub')}
        description={t(
          'Find and use content that is supported by Red Hat and our partners to deliver reassurance for the most demanding environments. Get started by exploring the options below.'
        )}
        headerActions={
          <PageActions
            actions={[
              {
                icon: CogIcon,
                label: t('Manage view'),
                type: PageActionType.Button,
                variant: ButtonVariant.link,
                isPinned: true,
                selection: PageActionSelection.None,
                onClick: openManageDashboard,
              },
            ]}
            position={DropdownPosition.right}
          />
        }
      />
      {managedCategories.length === 0 && (
        <Bullseye>
          <EmptyStateNoData
            button={
              <Button icon={<CogIcon />} onClick={openManageDashboard}>
                {t('Manage view')}
              </Button>
            }
            title={t('There is currently no content selected to be shown on the dashboard.')}
            description={t('Please manage this view by using the button below.')}
            variant="full"
          ></EmptyStateNoData>
        </Bullseye>
      )}
      <PageDashboard>
        {managedCategories.map((category) =>
          categorizedCollections[category.id] ? (
            <CollectionCategoryCarousel
              key={category.id}
              category={category.id}
              collections={categorizedCollections[category.id]}
              searchKey={category.searchKey}
              searchValue={category.searchValue}
            />
          ) : null
        )}
      </PageDashboard>
    </PageLayout>
  );
}
