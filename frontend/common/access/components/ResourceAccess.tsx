import { useTranslation } from 'react-i18next';
import { TeamAssignment } from '../interfaces/TeamAssignment';
import { UserAssignment } from '../interfaces/UserAssignment';
import { useMapContentTypeToDisplayName } from '../../../common/access/hooks/useMapContentTypeToDisplayName';
import { ColumnPriority, LoadingPage, ToolbarFilterType } from '../../../../framework';
import { useOptions } from '../../../common/crud/useOptions';
import { useMemo } from 'react';
import { edaAPI } from '../../../eda/common/eda-utils';
import { awxAPI } from '../../../awx/common/api/awx-utils';
import { Access } from './Access';
import { useGetLinkToResourcePage } from '../hooks/useGetLinkToResourcePage';

interface ContentTypeOption {
  value: string;
  display_name: string;
}

export function ResourceAccess(props: {
  service: 'awx' | 'eda' | 'hub';
  id: string;
  type: 'user-roles' | 'team-roles';
  addRolesRoute?: string;
}) {
  const { id, type, addRolesRoute, service } = props;
  const { t } = useTranslation();
  const getDisplayName = useMapContentTypeToDisplayName();
  const roleDefinitionsURL =
    service === 'awx' ? awxAPI`/role_definitions/` : edaAPI`/role_definitions/`;
  const roleUserAssignmentsURL =
    service === 'awx' ? awxAPI`/role_user_assignments/` : edaAPI`/role_user_assignments/`;
  const roleTeamAssignmentsURL =
    service === 'awx' ? awxAPI`/role_team_assignments/` : edaAPI`/role_team_assignments/`;
  const { data, isLoading } = useOptions<{
    actions: { POST: { content_type: { choices: ContentTypeOption[] } } };
  }>(roleDefinitionsURL);
  const getLinkToResourcePage = useGetLinkToResourcePage();

  // This filter applies to a user/team's roles list to filter based on the resource types
  const contentTypeFilterOptions = useMemo(() => {
    const options: ContentTypeOption[] = data?.actions?.POST?.content_type?.choices || [];
    return options?.map(({ value }) => ({
      value: value?.split('.').pop() || value,
      label: getDisplayName(value, { isTitleCase: true }),
    }));
  }, [data?.actions?.POST?.content_type?.choices, getDisplayName]);
  if (isLoading || !data) {
    return <LoadingPage />;
  }

  return (
    <Access
      service={service}
      tableColumnFunctions={{
        name: {
          function: (assignment: TeamAssignment | UserAssignment) =>
            assignment.summary_fields.content_object?.name,
          label: t('Resource name'),
          to: (assignment: TeamAssignment | UserAssignment) =>
            getLinkToResourcePage({
              contentType: assignment.content_type,
              objectId: assignment.object_id,
            }),
        },
      }}
      additionalTableColumns={[
        {
          header: t('Type'),
          type: 'description',
          sort: 'content_type',
          value: (item) => getDisplayName(item.content_type, { isTitleCase: true }),
          priority: ColumnPriority.last,
        },
      ]}
      additionalTableFilters={[
        {
          key: 'content-type',
          label: t('Resource type'),
          type: ToolbarFilterType.MultiSelect,
          placeholder: t('Select type'),
          query: 'content_type__model__contains',
          options: contentTypeFilterOptions,
          disableSortOptions: true,
        },
      ]}
      url={type === 'user-roles' ? roleUserAssignmentsURL : roleTeamAssignmentsURL}
      id={id}
      addRolesRoute={addRolesRoute}
      accessListType={type}
    />
  );
}
