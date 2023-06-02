import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, PageTab, PageTabs } from '../../../framework';
import { PageDetailsFromColumns } from '../../../framework/PageDetails/PageDetailsFromColumns';
import { RouteObj } from '../../Routes';
import { useGet } from '../../common/crud/useGet';
import { HubItemsResponse } from '../useHubView';
import { HubNamespace } from './HubNamespace';
import { useHubNamespacesColumns } from './hooks/useHubNamespacesColumns';

export function NamespaceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data } = useGet<HubItemsResponse<HubNamespace>>(
    `/api/automation-hub/_ui/v1/namespaces/?limit=1&name=${params.id ?? ''}`
  );
  let namespace: HubNamespace | undefined = undefined;
  if (data && data.data && data.data.length > 0) {
    namespace = data.data[0];
  }
  return (
    <PageLayout>
      <PageHeader
        title={namespace?.name}
        breadcrumbs={[
          { label: t('Namespaces'), to: RouteObj.Namespaces },
          { label: namespace?.name },
        ]}
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
