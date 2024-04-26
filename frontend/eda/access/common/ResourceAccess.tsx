import { useTranslation } from 'react-i18next';
import { TeamAssignment } from '../interfaces/TeamAssignment';
import { UserAssignment } from '../interfaces/UserAssignment';
import { Access } from './Access';
import { edaAPI } from '../../common/eda-utils';
import { useMapContentTypeToDisplayName } from '../../../common/access/hooks/useMapContentTypeToDisplayName';
import { ColumnPriority, LoadingPage, ToolbarFilterType } from '../../../../framework';
import { useOptions } from '../../../common/crud/useOptions';
import { useMemo } from 'react';

interface ContentTypeOption {
  value: string;
  display_name: string;
}

export function ResourceAccess(props: {
  id: string;
  type: 'user-roles' | 'team-roles';
  addRolesRoute?: string;
}) {
  const { id, type, addRolesRoute } = props;
  const { t } = useTranslation();
  const getDisplayName = useMapContentTypeToDisplayName();
  const { data, isLoading } = useOptions<{
    actions: { POST: { content_type: { choices: ContentTypeOption[] } } };
  }>(edaAPI`/role_definitions/`);

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
      tableColumnFunctions={{
        name: {
          // TODO: content_object?.name not available in the API yet. It is being added.
          function: (assignment: TeamAssignment | UserAssignment) =>
            assignment.summary_fields.content_object?.name,
          label: t('Resource name'),
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
      url={
        type === 'user-roles' ? edaAPI`/role_user_assignments/` : edaAPI`/role_team_assignments/`
      }
      id={id}
      addRolesRoute={addRolesRoute}
      accessListType={type}
    />
  );
}
