import { DropdownPosition } from '@patternfly/react-core';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageActions,
  PageHeader,
  PageTable,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../framework';
import { RouteObj } from '../../Routes';
import { useGet } from '../../common/crud/useGet';
import { hubAPI } from '../api/utils';
import { HubNamespace } from './HubNamespace';
import { HubNamespaceMetadataType } from './HubNamespaceMetadataType';
import { useHubView } from '../useHubView';
import { usePulpSearchView } from '../usePulpSearchView';
import { useHubNamespaceDetailsToolbarActions } from './hooks/useHubNamespaceDetailsToolbarActions';
import { useHubNamespaceActions } from './hooks/useHubNamespaceActions';
import { useHubNamespaceMetadataActions } from './hooks/useHubNamespaceMetadataActions';
import { useHubNamespaceMetadataColumns } from './hooks/useHubNamespaceMetadataColumns';
import { useCollectionFilters } from '../collections/hooks/useCollectionFilters';
import { useHubNamespaceDetailsFilters } from '../namespaces/hooks/useHubNamespaceDetailsFilters';
import { useCollectionVersionColumns } from '../collections/hooks/useCollectionVersionColumns';
import { CollectionVersionSearch } from '../collections/CollectionVersionSearch';
import { hubAPI } from '../api';
import { DropdownPosition } from '@patternfly/react-core';

export function NamespaceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data } = useGet<HubNamespaceResponse<HubNamespace>>(
    `/api/automation-hub/pulp/api/v3/pulp_ansible/namespaces/?limit=1&name=${params.id ?? ''}`
  );
  let namespace: HubNamespace | undefined = undefined;
  if (data && data.results && data.count > 0) {
    namespace = data.results[0];
  }

  const pageActions = useHubNamespaceActions();
  return (
    <PageLayout>
      <PageHeader
        title={namespace?.name}
        breadcrumbs={[{ label: t('Namespaces'), to: RouteObj.Namespaces }, { label: params.id }]}
        headerActions={
          <PageActions<HubNamespace>
            actions={pageActions}
            position={DropdownPosition.right}
            selectedItem={namespace}
          />
        }
      />
      <PageTabs>
        <PageTab label={t('Collections')}>
          <CollectionsTab namespace={namespace} />
        </PageTab>
        <PageTab label={t('Namespace Details')}>
          <NamespaceDetailsTab namespace={namespace} />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}

function NamespaceDetailsTab(props: { namespace?: HubNamespace }) {
  const { t } = useTranslation();
  const toolbarFilters = useHubNamespaceDetailsFilters();
  const toolbarActions = useHubNamespaceDetailsToolbarActions();
  const tableColumns = useHubNamespaceMetadataColumns();
  const rowActions = useHubNamespaceMetadataActions();
  const view = usePulpSearchView<HubNamespaceMetadataType>({
    url: hubAPI`/v3/plugin/ansible/search/namespace-metadata/`,
    keyFn: (item) => item.metadata.pulp_href + ':' + item.repository.name,
    tableColumns,
    toolbarFilters,
    sortKey: 'order_by',
    queryParams: { name: props?.namespace?.name },
  });
  return (
    <PageLayout>
      <PageTable
        tableColumns={tableColumns}
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        errorStateTitle={t('Error loading namespaces')}
        emptyStateTitle={t('No namespaces yet')}
        {...view}
        defaultTableView="list"
        defaultSubtitle={t('Namespace')}
      />
    </PageLayout>
  );
}

function CollectionsTab(props: { namespace?: HubNamespace }) {
  const { t } = useTranslation();
  const toolbarFilters = useCollectionFilters();
  const tableColumns = useCollectionVersionColumns();
  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions/`,
    keyFn: (item) => item.collection_version.pulp_href + ':' + item.repository.name,
    tableColumns,
    queryParams: { namespace: props?.namespace?.name },
  });
  const navigate = useNavigate();

  return (
    <PageLayout>
      <PageTable<CollectionVersionSearch>
        toolbarFilters={toolbarFilters}
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
