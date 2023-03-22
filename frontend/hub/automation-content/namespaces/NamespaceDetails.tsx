import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, PageTab, PageTabs } from '../../../../framework';
import { PageDetailsFromColumns } from '../../../../framework/PageDetails/PageDetailsFromColumns';
import { useGet } from '../../../common/crud/useGet';
import { RouteObj } from '../../../Routes';
import { HubItemsResponse } from '../../useHubView';
import { useNamespacesColumns } from './hooks/useNamespacesColumns';
import { Namespace } from './Namespace';

export function NamespaceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data } = useGet<HubItemsResponse<Namespace>>(
    `/api/automation-hub/_ui/v1/namespaces/?limit=1&name=${params.id ?? ''}`
  );
  let namespace: Namespace | undefined = undefined;
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

function NamespaceDetailsTab(props: { namespace?: Namespace }) {
  const { namespace } = props;
  const tableColumns = useNamespacesColumns();
  return <PageDetailsFromColumns item={namespace} columns={tableColumns} />;
}
