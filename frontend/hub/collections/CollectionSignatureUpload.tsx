import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  CodeBlock,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  DropdownPosition,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  PageSection,
  SearchInput,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import {
  CopyCell,
  PFColorE,
  PageActions,
  PageDetails,
  PageDetailsFromColumns,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
  getPatternflyColor,
  useBreakpoint,
} from '../../../framework';
import { PageDetail } from '../../../framework/PageDetails/PageDetail';
import { Scrollable } from '../../../framework/components/Scrollable';
import { RouteObj } from '../../common/Routes';
import { StatusCell } from '../../common/Status';
import { useGet } from '../../common/crud/useGet';
import { hubAPI } from '../api/utils';
import { HubItemsResponse } from '../useHubView';
import { CollectionVersionSearch } from './Collection';
import { useCollectionActions } from './hooks/useCollectionActions';
import { HubRoute } from '../HubRoutes';
import { useGetPageUrl } from '../../../framework';
export function CollectionSignatureUpload() {
  const { t } = useTranslation();
  const location = useLocation();
  const getPageUrl = useGetPageUrl();
  const { data, refresh } = useGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?${location.search}`
  );
  let collection: CollectionVersionSearch | undefined = undefined;
  if (data && data.data && data.data.length > 0) {
    collection = data.data[0];
  }
  const itemActions = useCollectionActions(() => void refresh());
  return (
    <PageLayout>
      <PageHeader
        title={collection?.collection_version.name}
        breadcrumbs={[
          { label: t('Collections'), to: getPageUrl(HubRoute.Collections) },
          { label: collection?.collection_version.name },
        ]}
        headerActions={
          <PageActions<CollectionVersionSearch>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={collection}
          />
        }
      />
    </PageLayout>
  );
}
