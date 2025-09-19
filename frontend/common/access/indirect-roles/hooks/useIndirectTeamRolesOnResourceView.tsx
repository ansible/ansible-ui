import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetAll } from '@ansible/platform-ui/common/useGetAll';
import { useGetPageUrl, useInMemoryView } from '@ansible/ansible-ui-framework';
import { usePlatformView } from '@ansible/platform-ui/hooks/usePlatformView';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { PlatformRoute } from '@ansible/platform-ui/main/PlatformRoutes';
import { PlatformRole } from '@ansible/platform-ui/interfaces/PlatformRole';

type IntermediaryRole = { role_definition: { name: string; url: string } };
interface RoleUserAssignment {
  content_type: string;
  id: number;
  intermediary_roles: IntermediaryRole[];
  object_ansible_id: string | null;
  object_id: string;
  role_definition: number;
  user: string;
  user_ansible_id: string;
  summary_fields: {
    content_object: {
      name: string;
      id: number;
    };
    role_definition: {
      name: string;
      managed: boolean;
      description: string;
      id: number;
    };
    user: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
  };
}

function roleUserAccessUrl(resourceType?: string, resourceId?: string, ansibleUserId?: string) {
  if (!resourceType || !resourceId || !ansibleUserId) return '';
  const [service] = resourceType.split('.');
  const path = `role_user_access/${resourceType}/${resourceId}/${ansibleUserId}/`;
  switch (service) {
    case 'awx':
      return awxAPI`/${path}`;
    case 'eda':
      return edaAPI`/${path}`;
    default:
      return gatewayAPI`/${path}`;
  }
}

function useRoleDefinitions() {
  const { items: roleDefinitions } = useGetAll<PlatformRole>(gatewayAPI`/role_definitions/`, 200);
  return roleDefinitions;
}

export function useIndirectTeamRolesOnResourceView(
  resourceType: string | undefined,
  resourceId: string | undefined,
  ansibleUserId: string | undefined
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const roleDefinitions = useRoleDefinitions();

  const tableColumns = useMemo(
    () => [
      {
        header: t('Name'),
        cell: (item: RoleUserAssignment) => {
          const roleName = item.intermediary_roles?.[0]?.role_definition.name;
          const roleId = roleName
            ? roleDefinitions?.find((r) => r.name === roleName)?.id
            : undefined;
          return roleName ? (
            <Link
              to={getPageUrl(PlatformRoute.RoleDetails, {
                params: { id: roleId },
              })}
            >
              {roleName}
            </Link>
          ) : (
            ''
          );
        },
        sort: undefined,
      },
      {
        header: t('Description'),
        cell: (item: RoleUserAssignment) => {
          const roleName = item.intermediary_roles?.[0]?.role_definition.name;
          const description = roleName
            ? roleDefinitions?.find((r) => r.name === roleName)?.description
            : undefined;
          return description ?? '';
        },
        sort: undefined,
      },
      {
        header: t('Inherited from'),
        cell: (item: RoleUserAssignment) => {
          const contentObjectName = item.summary_fields?.content_object?.name;
          const contentObjectId = item.summary_fields?.content_object?.id;
          return contentObjectName ? (
            <Link to={getPageUrl(PlatformRoute.TeamDetails, { params: { id: contentObjectId } })}>
              {contentObjectName}
            </Link>
          ) : (
            ''
          );
        },
        sort: undefined,
      },
    ],
    [getPageUrl, t, roleDefinitions]
  );

  const base = usePlatformView<RoleUserAssignment>({
    url:
      resourceType && resourceId && ansibleUserId
        ? roleUserAccessUrl(resourceType, resourceId, ansibleUserId)
        : (undefined as unknown as string),
    queryParams: { content_type__api_slug: 'shared.team' },
    tableColumns,
    disableQueryString: true,
    defaultSort: undefined,
  });

  const flattened = useMemo(() => {
    const items = base.pageItems ?? [];
    const out: RoleUserAssignment[] = [];
    items.forEach((item) => {
      const roles = item.intermediary_roles ?? [];
      if (!roles.length) out.push(item);
      else roles.forEach((r) => out.push({ ...item, intermediary_roles: [r] }));
    });
    return out;
  }, [base.pageItems]);

  const view = useInMemoryView<RoleUserAssignment>({
    items: flattened,
    tableColumns,
    disableQueryString: true,
    keyFn: (item) => {
      const roleName = item.intermediary_roles?.[0]?.role_definition?.name ?? 'no-role';
      return `${item.id}::${roleName}`;
    },
  });

  return { view, tableColumns };
}
