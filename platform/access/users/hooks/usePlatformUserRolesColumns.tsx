import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useGetLinkToResourcePage } from '@ansible/common-ui/access/hooks/useGetLinkToResourcePage';
import { useMapContentTypeToDisplayName } from '@ansible/common-ui/access/hooks/useMapContentTypeToDisplayName';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useGetResourceEndpoint } from '../../../hooks/useGetResourceEndpoint';
import { ContentType } from '../../roles/hooks/ContentType';
import { useContentTypeComponentNames } from '../../roles/hooks/useContentTypeComponentNames';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { RequestError } from '@ansible/common-ui/crud/RequestError';

export function useAsyncQueryField(
  props: Readonly<{
    url: string;
    id: number | string | undefined;
    field?: string;
    resourceName?: string;
  }>
): string | undefined {
  const { data, error } = useGetItem<Record<string, unknown>>(props.url, props.id, {
    refreshInterval: 0, // Disable refresh on querying labels
  });

  if (props.id === undefined) return undefined;

  if (error) {
    if (error.name === 'RequestError') {
      const requestError = error as RequestError;
      if (requestError.statusCode === 404) {
        return props?.id?.toString();
      }
      // AAP-40529
      // Workaround for RBAC issues: a user with no permissions should
      // still be able to see the value even if it can't access to it.
      if (requestError.statusCode === 403) {
        return props.resourceName;
      } else {
        return error.message;
      }
    }
  }

  if (!data) {
    return props?.id?.toString();
  }

  const value = data[props.field ?? 'name'];

  switch (typeof value) {
    case 'string':
      return value;
    case 'number':
      return value?.toString();
    default:
      return props?.id?.toString();
  }
}

function ResourceNameCell({ role }: { role: UserAssignment }) {
  const endpoint = useGetResourceEndpoint(role.content_type, role.object_id);
  const resourceName = useAsyncQueryField({
    url: endpoint ?? '',
    id: role.object_id,
    field: 'name',
  });
  const getLinkToResourcePage = useGetLinkToResourcePage(resourceName ?? '');

  const pageUrl =
    getLinkToResourcePage({
      contentType: role.content_type,
      objectId: role.object_id,
    }) ?? '#';

  return <Link to={pageUrl}>{resourceName ?? role.object_id}</Link>;
}

export function usePlatformUserRolesColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
  disableExtraColumns?: boolean;
}) {
  const { t } = useTranslation();
  const getDisplayName = useMapContentTypeToDisplayName();
  const getContentTypeComponentNames = useContentTypeComponentNames();
  const getPageUrl = useGetPageUrl();

  return useMemo<ITableColumn<UserAssignment>[]>(
    () => [
      {
        header: t('Resource name'),
        cell: (role) => <ResourceNameCell role={role} />,
        sort: options?.disableSort ? undefined : 'name',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Role'),
        type: 'text',
        value: (role) => role.summary_fields.role_definition.name,
        sort: options?.disableSort ? undefined : 'role',
        to: (role) =>
          options?.disableLinks
            ? undefined
            : getPageUrl(PlatformRoute.RoleDetails, {
                params: { id: role.role_definition },
              }),
      },
      {
        header: t('Type'),
        type: 'text',
        value: (role) => getDisplayName(role.content_type, { isTitleCase: true }),
        sort: options?.disableSort ? undefined : 'type',
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('Component'),
        type: 'labels',
        value: (role) => getContentTypeComponentNames(role.content_type as ContentType),
      },
    ],
    [
      t,
      options?.disableSort,
      options?.disableLinks,
      getContentTypeComponentNames,
      getDisplayName,
      getPageUrl,
    ]
  );
}
