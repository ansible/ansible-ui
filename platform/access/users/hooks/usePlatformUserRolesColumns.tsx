import { ITableColumn, TextCell } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentType } from '../../roles/hooks/ContentType';
import { useContentTypeComponentNames } from '../../roles/hooks/useContentTypeComponentNames';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { useMapContentTypeToDisplayName } from '@ansible/common-ui/access/hooks/useMapContentTypeToDisplayName';
import { useGetLinkToResourcePage } from '@ansible/common-ui/access/hooks/useGetLinkToResourcePage';
import { AsyncQueryLabel } from '@ansible/common-ui/AsyncQueryLabel';
import { Link } from 'react-router';
import { useGetResourceEndpoint } from '../../../hooks/useGetResourceEndpoint';

function ResourceNameCell({ role }: { role: UserAssignment }) {
  const endpoint = useGetResourceEndpoint(role.content_type, role.object_id);
  const getLinkToResourcePage = useGetLinkToResourcePage();

  const pageUrl = getLinkToResourcePage({
    contentType: role.content_type,
    objectId: role.object_id,
  });

  return (
    <Link to={pageUrl ?? '#'}>
      {<AsyncQueryLabel url={endpoint ?? ''} id={role.object_id} field="name" />}
    </Link>
  );
}

export function usePlatformUserRolesColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
  disableExtraColumns?: boolean;
}) {
  const { t } = useTranslation();
  const getDisplayName = useMapContentTypeToDisplayName();
  const getContentTypeComponentNames = useContentTypeComponentNames();

  return useMemo<ITableColumn<UserAssignment>[]>(
    () => [
      {
        header: t('Resource name'),
        cell: (role) => <ResourceNameCell role={role} />,
        sort: undefined,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Role'),
        cell: (item) => <TextCell text={item.summary_fields.role_definition.description} />,
        card: 'description',
        list: 'description',
        sort: undefined,
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
        value: (role) => getContentTypeComponentNames((role.content_type ?? '') as ContentType),
        modal: 'hidden',
      },
    ],
    [t, options?.disableSort, getContentTypeComponentNames, getDisplayName]
  );
}
