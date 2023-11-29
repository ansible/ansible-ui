import { useParams } from 'react-router-dom';
import { LoadingPage } from '../../../../framework';
import { PageDetailsFromColumns } from '../../../../framework/PageDetails/PageDetailsFromColumns';
import { useGet } from '../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { HubNamespace } from '../HubNamespace';
import { useHubNamespacesColumns } from '../hooks/useHubNamespacesColumns';
import { hubAPI } from '../../api/formatPath';
import { HubError } from '../../common/HubError';

export function HubNamespaceCLI() {
  const params = useParams<{ id: string }>();
  const {
    data: response,
    error,
    refresh,
  } = useGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id ?? ''}`
  );
  const tableColumns = useHubNamespacesColumns();

  if (!response || !response.data || (response.data.length === 0 && !error)) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  return;
  <PageDetailsFromColumns item={response.data[0]} columns={tableColumns} />;
}
