import { PageDetails, PageDetailsFromColumns } from '@ansible/ansible-ui-framework';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useParams } from 'react-router';
import { useLegacyTokenColumns } from './hooks/useLegacyTokenColumns';

export function LegacyTokenDetails() {
  const params = useParams<{ tokenid: string }>();
  const {
    error: tokenError,
    data: token,
    refresh: refreshToken,
  } = useGetItem<Token>(awxAPI`/tokens/`, params.tokenid);
  const columns = useLegacyTokenColumns({ disableLinks: true });
  if (tokenError) return <AwxError error={tokenError} handleRefresh={refreshToken} />;
  if (!token) return <LoadingState />;
  return (
    <PageDetails>
      <PageDetailsFromColumns columns={columns} item={token} />
    </PageDetails>
  );
}
