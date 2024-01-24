import { useParams } from 'react-router-dom';
import { LoadingPage } from '../../../../framework';
import { HubError } from '../../common/HubError';
import { useHubContext } from '../../common/useHubContext';
import { HubResourceAccessUsers } from '../../access/resource-access/HubResourceAccessUsers';
import { useGetNamespaceAndUsersWithAccess } from '../hooks/useGetNamespaceAndUsersWithAccess';
import { HubRoute } from '../../main/HubRoutes';

export function HubNamespaceUserAccess() {
  const params = useParams<{ id: string }>();
  const {
    data: response,
    error,
    refresh,
    namespace,
    usersWithAccess,
  } = useGetNamespaceAndUsersWithAccess(params.id ?? '');

  const { hasPermission, user } = useHubContext();
  const canEditAccess = Boolean(
    hasPermission('galaxy.change_namespace') ||
      namespace?.related_fields?.my_permissions?.includes('galaxy.change_namespace') ||
      user.is_superuser
  );

  if (!response || !response.data || (response.data.length === 0 && !error)) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  return (
    <HubResourceAccessUsers
      users={usersWithAccess ?? []}
      canEditAccess={canEditAccess}
      resourceId={params.id ?? ''}
      userPageRoute={HubRoute.NamespaceUserPage}
      addUserRoute={HubRoute.NamespaceUserAccessAddUser}
    />
  );
}
