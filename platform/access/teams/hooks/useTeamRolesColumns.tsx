import { ITableColumn } from '@ansible/ansible-ui-framework';
import { useGetLinkToResourcePage } from '@ansible/common-ui/access/hooks/useGetLinkToResourcePage';
import { useMapContentTypeToDisplayName } from '@ansible/common-ui/access/hooks/useMapContentTypeToDisplayName';
import { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';
import { AsyncQueryLabel } from '@ansible/common-ui/AsyncQueryLabel';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useGetResourceEndpoint } from '../../../hooks/useGetResourceEndpoint';
import { ContentType } from '../../roles/hooks/ContentType';
import { useContentTypeComponentNames } from '../../roles/hooks/useContentTypeComponentNames';

function ResourceNameCell({ role }: { role: TeamAssignment }) {
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

export function useTeamRolesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getDisplayName = useMapContentTypeToDisplayName();
  const getContentTypeComponentNames = useContentTypeComponentNames();

  return useMemo<ITableColumn<TeamAssignment>[]>(
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
        card: 'subtitle',
        list: 'subtitle',
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
    [t, options?.disableSort, getContentTypeComponentNames, getDisplayName]
  );
}
