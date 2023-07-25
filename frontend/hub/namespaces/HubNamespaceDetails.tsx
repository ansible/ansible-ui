import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, PageTab, PageTabs } from '../../../framework';
import { PageDetailsFromColumns } from '../../../framework/PageDetails/PageDetailsFromColumns';
import { RouteObj } from '../../Routes';
import { useGet } from '../../common/crud/useGet';
import { HubItemsResponse } from '../useHubView';
import { HubNamespace } from './HubNamespace';
import { useHubNamespaceActions } from './hooks/useHubNamespaceActions';
import { useHubNamespacesColumns } from './hooks/useHubNamespacesColumns';
import { DropdownPosition } from '@patternfly/react-core';
import { hubAPI } from '../api';

export function NamespaceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data } = useGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id ?? ''}`
  );
  let namespace: HubNamespace | undefined = undefined;
  if (data && data.data && data.data.length > 0) {
    namespace = data.data[0];
  }

  const pageActions = useHubNamespaceActions();
  return (
    <PageLayout>
      <PageHeader
        title={namespace?.name}
        breadcrumbs={[
          { label: t('Namespaces'), to: RouteObj.Namespaces },
          { label: namespace?.name },
        ]}
        headerActions={
          <PageActions<HubNamespace>
            actions={pageActions}
            position={DropdownPosition.right}
            selectedItem={namespace}
          />
        }
      />
      <PageTabs>
        <PageTab label={t('Details')}>
          <NamespaceDetailsTab namespace={namespace} />
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
