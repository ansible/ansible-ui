import { useParams } from 'react-router-dom';
import { LoadingPage } from '../../../../framework';
import { PageDetailsFromColumns } from '../../../../framework/PageDetails/PageDetailsFromColumns';
import { useGet } from '../../../common/crud/useGet';
import { hubAPI } from '../../api/utils';
import { HubItemsResponse } from '../../useHubView';
import { HubNamespace } from '../HubNamespace';
import { useHubNamespacesColumns } from '../hooks/useHubNamespacesColumns';

export function HubNamespaceDetails() {
  const params = useParams<{ id: string }>();
  const { data: response } = useGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id ?? ''}`
  );
  const tableColumns = useHubNamespacesColumns();
  if (!response || !response.data || response.data.length === 0) {
    return <LoadingPage />;
  }
  return <PageDetailsFromColumns item={response.data[0]} columns={tableColumns} />;
}
