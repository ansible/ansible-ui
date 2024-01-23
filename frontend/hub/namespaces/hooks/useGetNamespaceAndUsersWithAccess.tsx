import { useMemo } from 'react';
import { useGet } from '../../../common/crud/useGet';
import { HubResourceAccessUser } from '../../access/resource-access/HubResourceAccessInterfaces';
import { hubAPI } from '../../common/api/formatPath';
import { HubItemsResponse } from '../../common/useHubView';
import { HubNamespace } from '../HubNamespace';

export function useGetNamespaceAndUsersWithAccess(name: string) {
  const { data, error, refresh } = useGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?limit=1&name=${name}&include_related=my_permissions`
  );

  const namespace = useMemo<HubNamespace | undefined>(() => {
    if (data && data.data && data.data.length > 0) {
      return data.data[0];
    }
    return undefined;
  }, [data]);

  const usersWithAccess = useMemo<HubResourceAccessUser[]>(
    () =>
      namespace
        ? namespace.users.map(({ name, object_roles }) => ({
            username: name,
            object_roles,
          }))
        : [],
    [namespace]
  );

  return useMemo(
    () => ({
      data,
      error,
      refresh,
      namespace: namespace,
      usersWithAccess: usersWithAccess,
    }),
    [data, error, namespace, refresh, usersWithAccess]
  );
}
