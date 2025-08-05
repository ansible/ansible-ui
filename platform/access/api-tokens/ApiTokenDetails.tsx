import { PageDetails, PageDetailsFromColumns } from '@ansible/ansible-ui-framework';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useParams } from 'react-router';
import { Token } from '../../interfaces/Token';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { useApiTokenColumns } from './hooks/useApiTokenColumns';

export function ApiTokenDetails() {
  const params = useParams<{ tokenid: string }>();
  const {
    error: tokenError,
    data: token,
    refresh: refreshToken,
  } = useGetItem<Token>(gatewayAPI`/tokens/`, params.tokenid);
  const columns = useApiTokenColumns({ disableLinks: true });
  if (tokenError) return <AwxError error={tokenError} handleRefresh={refreshToken} />;
  if (!token) return <LoadingState />;
  return (
    <PageDetails>
      <PageDetailsFromColumns columns={columns} item={token} />
    </PageDetails>
  );
}
