import { useParams } from 'react-router-dom';
import { LoadingPage, PageDetails } from '../../../../framework';
import { PageDetailsFromColumns } from '../../../../framework/PageDetails/PageDetailsFromColumns';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { hubAPI } from '../../common/api/formatPath';
import { HubItemsResponse } from '../../common/useHubView';
import { HubNamespace } from '../HubNamespace';
import { useHubNamespacesColumns } from '../hooks/useHubNamespacesColumns';

export function HubNamespaceDetails() {
  const params = useParams<{ id: string }>();
  const {
    data: response,
    error,
    refresh,
  } = useGet<HubItemsResponse<HubNamespace>>(hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id}`);
  const tableColumns = useHubNamespacesColumns();

  if (!response || !response.data || (response.data.length === 0 && !error)) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  return (
    <PageDetails>
      <PageDetailsFromColumns item={response.data[0]} columns={tableColumns} />
    </PageDetails>
  );
}
