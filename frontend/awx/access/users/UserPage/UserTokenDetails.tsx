import { useParams } from 'react-router-dom';
import { LoadingPage, PageDetails, PageDetailsFromColumns } from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxError } from '../../../common/AwxError';
import { Token } from '../../../interfaces/Token';
import { AwxUser } from '../../../interfaces/User';
import { useUserTokensColumns } from '../hooks/useUserTokensColumns';

export function UserTokenDetails() {
  const params = useParams<{ id: string; tokenid: string }>();
  const {
    error: userError,
    data: user,
    refresh: refreshUser,
  } = useGetItem<AwxUser>(awxAPI`/users`, params.id);
  const {
    error: tokenError,
    data: token,
    refresh: refreshToken,
  } = useGetItem<Token>(awxAPI`/tokens`, params.tokenid);

  if (userError) return <AwxError error={userError} handleRefresh={refreshUser} />;
  if (tokenError) return <AwxError error={tokenError} handleRefresh={refreshToken} />;

  if (!user || !token) return <LoadingPage breadcrumbs tabs />;

  return <UserTokenDetailsInternal token={token} user={user} />;
}

function UserTokenDetailsInternal(props: { token: Token; user: AwxUser }) {
  const { token, user } = props;

  const userTokensColumns = useUserTokensColumns(user, { disableLinks: true });

  return (
    <PageDetails>
      <PageDetailsFromColumns columns={userTokensColumns} item={token}></PageDetailsFromColumns>
    </PageDetails>
  );
}
