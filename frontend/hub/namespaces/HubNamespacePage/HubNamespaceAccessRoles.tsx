import { useParams } from 'react-router-dom';
import { HubResourceAccessRoles } from '../../access/resource-access/HubResourceAccessRoles';
import { useGetNamespaceAndUsersWithAccess } from '../hooks/useGetNamespaceAndUsersWithAccess';
import { LoadingPage } from '../../../../framework';
import { HubError } from '../../common/HubError';
import { useHubContext } from '../../common/useHubContext';
import { useMemo } from 'react';

export function HubNamespaceAccessRoles() {
  const params = useParams<{ id: string; username?: string; teamname?: string }>();
  const {
    data: response,
    error,
    refresh,
    namespace,
    usersWithAccess,
  } = useGetNamespaceAndUsersWithAccess(params.id ?? '');

  const selectedUser = useMemo(
    () => usersWithAccess?.find((user) => user.username === params.username),
    [params.username, usersWithAccess]
  );
  const selectedTeam = useMemo(
    () => namespace?.groups?.find((group) => group.name === params.teamname),
    [namespace?.groups, params.teamname]
  );

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

  return selectedUser ? (
    <HubResourceAccessRoles user={selectedUser} canEditAccess={canEditAccess} />
  ) : selectedTeam ? (
    <HubResourceAccessRoles team={selectedTeam} canEditAccess={canEditAccess} />
  ) : null;
}
