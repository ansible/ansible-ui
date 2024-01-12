import { useParams } from 'react-router-dom';
import { LoadingPage, PageDetailsFromColumns } from '../../../../framework';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { useUsersColumns } from '../hooks/useUserColumns';

export function PlatformUserDetails() {
  const params = useParams<{ id: string }>();
  const columns = useUsersColumns();
  const { data: user, isLoading } = useGetItem<PlatformUser>(gatewayAPI`/users`, params.id);
  if (isLoading) return <LoadingPage />;
  return <PageDetailsFromColumns columns={columns} item={user} />;
}
