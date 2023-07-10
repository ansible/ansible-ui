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
import { PageDetailsFromColumns } from '../../../framework';
import { RouteObj } from '../../Routes';
import { useGet } from '../../common/crud/useGet';
import { HubNamespaceResponse } from '../useHubView';
import { HubNamespace } from './HubNamespace';
import { useHubView } from '../useHubView';
import { useHubNamespaceActions } from './hooks/useHubNamespaceActions';
import { useHubNamespacesColumns } from './hooks/useHubNamespacesColumns';
import { useCollectionFilters } from '../collections/hooks/useCollectionFilters';
import { useCollectionsActions } from '../collections/hooks/useCollectionsActions';
import { useCollectionColumns } from '../collections/hooks/useCollectionColumns';
import { useCollectionActions } from '../collections/hooks/useCollectionActions';
import { Collection } from '../collections/Collection';
import { idKeyFn, hubAPI } from '../api';

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
          <NamespaceDetailsTab />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}

function NamespaceDetailsTab(props: { namespace?: HubNamespace }) {
  const { namespace } = props;
  const tableColumns = useHubNamespacesColumns();
  return <PageDetailsFromColumns item={namespace} columns={tableColumns} />;
}

function CollectionsTab(props: { namespace?: HubNamespace }) {
  const { t } = useTranslation();
  const toolbarFilters = useCollectionFilters();
  const tableColumns = useCollectionColumns();
  const view = useHubView<Collection>({
    url: hubAPI`/_ui/v1/repo/published/`,
    keyFn: idKeyFn,
    toolbarFilters,
    tableColumns,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    queryParams: { namespace: props?.namespace?.name },
  });
  const toolbarActions = useCollectionsActions(view.unselectItemsAndRefresh);
  const rowActions = useCollectionActions(view.unselectItemsAndRefresh);
  const navigate = useNavigate();

  return (
    <PageLayout>
      <PageTable<Collection>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
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
