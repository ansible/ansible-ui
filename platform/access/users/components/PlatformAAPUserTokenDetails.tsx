import { useParams } from 'react-router-dom';
import { LoadingPage, PageDetails, PageDetailsFromColumns } from '../../../../framework';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { Token } from '../../../../frontend/awx/interfaces/Token';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { useUserTokensColumns } from '../hooks/useAAPUserTokensColumns'

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

  if (userError) return <AwxError error={userError}  handleRefresh={refreshUser} />;
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
