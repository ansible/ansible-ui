import { ITableColumn, LabelsCell, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { UserRoleAccess } from '@ansible/common-ui/access/interfaces/UserRoleAccess';
import { useGetAll } from '@ansible/platform-ui/common/useGetAll';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformRoute } from '../../../main/PlatformRoutes';

// Custom hook to get role definitions
function useRoleDefinitions() {
  const { items: roleDefinitions, isLoading } = useGetAll<{
    id: number;
    name: string;
    url: string;
  }>(gatewayAPI`/role_definitions/`, 200);
  return { roleDefinitions, isLoading };
}

export function useOrganizationUserColumns(options?: { disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { roleDefinitions } = useRoleDefinitions();

  // Create a map of role names to role IDs for quick lookup
  const roleNameToIdMap = useMemo(() => {
    const map = new Map<string, number>();
    roleDefinitions?.forEach((role) => {
      map.set(role.name, role.id);
    });
    return map;
  }, [roleDefinitions]);

  const tableColumns = useMemo<ITableColumn<UserRoleAccess>[]>(
    () => [
      {
        header: t('Username'),
        cell: (user) => (
          <TextCell
            text={user?.username}
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(PlatformRoute.UserDetails, { params: { id: user?.id } })
            }
          />
        ),
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
        defaultSort: true,
      },
      {
        header: t('First name'),
        type: 'text',
        value: (user) => user?.first_name,
        sort: 'first_name',
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (user) => user?.last_name,
        sort: 'last_name',
      },
      {
        header: t('Organization roles'),
        cell: (item: UserRoleAccess) => (
          <LabelsCell
            labelsWithLinks={item?.object_role_assignments?.map((obj) => {
              const roleName = obj?.role_definition?.name;
              const roleId = roleNameToIdMap.get(roleName);

              return {
                name: roleName,
                link: getPageUrl(PlatformRoute.RoleDetails, {
                  params: { id: roleId },
                }),
              };
            })}
          />
        ),
      },
    ],
    [getPageUrl, options?.disableLinks, roleNameToIdMap, t]
  );
  return tableColumns;
}
