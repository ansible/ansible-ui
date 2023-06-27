import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardHeaderMain,
  CardTitle,
  Divider,
  Grid,
  GridItem,
  Label,
  LabelGroup,
  PageSection,
  Split,
  SplitItem,
  Stack,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CircleIcon,
  ExternalLinkAltIcon,
  RedhatIcon,
} from '@patternfly/react-icons';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { RouteObj } from '../../Routes';
import { useHubView } from '../useHubView';
import { CollectionVersionSearch } from './Collection';
//import { useCollectionActions } from './hooks/useCollectionActions';
import { useCollectionColumns } from './hooks/useCollectionColumns';
//import { useCollectionFilters } from './hooks/useCollectionFilters';
import { useCollectionsActions } from './hooks/useCollectionsActions';
import { hubAPI } from '../api';

export function Collections() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  //const toolbarFilters = useCollectionFilters();
  const tableColumns = useCollectionColumns();
  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions`,
    keyFn: (item) => item.collection_version.pulp_href,
  });

  //const toolbarActions = useCollectionsActions(view.unselectItemsAndRefresh);
  //const rowActions = useCollectionActions(view.unselectItemsAndRefresh);
  return (
    <PageLayout>
      <PageHeader
        title={t('Collections')}
        description={t(
          'Collections are a packaged unit of Ansible content that includes roles, modules, plugins, and other components, making it easier to share and reuse automation functionality.'
        )}
        titleHelpTitle={t('Collection')}
        titleHelp={t(
          'Collections are a packaged unit of Ansible content that includes roles, modules, plugins, and other components, making it easier to share and reuse automation functionality.'
        )}
        titleDocLink="https://docs.ansible.com/ansible/latest/user_guide/collections_using.html"
      />

      <PageTable<CollectionVersionSearch>
        tableColumns={tableColumns}
        errorStateTitle={t('Error loading collections')}
        emptyStateTitle={t('No collections yet')}
        emptyStateDescription={t('To get started, upload a collection.')}
        emptyStateButtonText={t('Upload collection')}
        emptyStateButtonClick={() => navigate(RouteObj.UploadCollection)}
        {...view}
        defaultTableView="list"
        defaultSubtitle={t('Collection')}
      />
    </PageLayout>
  );
}
