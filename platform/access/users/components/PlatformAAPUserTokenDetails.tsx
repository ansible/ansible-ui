import { LoadingPage, PageDetails, PageDetailsFromColumns } from '@ansible/ansible-ui-framework';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useParams } from 'react-router-dom';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useUserTokensColumns } from '../hooks/useAAPUserTokensColumns';

export function PlatformAAPUserTokenDetails() {
  const params = useParams<{ id: string; tokenid: string }>();
  const {
    error: userError,
    data: user,
    refresh: refreshUser,
  } = useGetItem<PlatformUser>(gatewayAPI`/users`, params.id);
  const {
    error: tokenError,
    data: token,
    refresh: refreshToken,
  } = useGetItem<Token>(gatewayAPI`/tokens/`, params.tokenid);

  if (userError) return <AwxError error={userError} handleRefresh={refreshUser} />;
  if (tokenError) return <AwxError error={tokenError} handleRefresh={refreshToken} />;

  if (!user || !token) return <LoadingPage breadcrumbs tabs />;

  return <UserTokenDetailsInternal token={token} />;
}

function UserTokenDetailsInternal(props: { token: Token }) {
  const { token } = props;

  const userTokensColumns = useUserTokensColumns({ disableLinks: true });

  return (
    <PageDetails>
      <PageDetailsFromColumns columns={userTokensColumns} item={token}></PageDetailsFromColumns>
    </PageDetails>
  );
}
