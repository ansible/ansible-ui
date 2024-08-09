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
import { PageSelectOption } from '../../../../framework/PageInputs/PageSelectOption';
import { hubAPI } from '../../../hub/common/api/formatPath';

interface ContentTypeOption {
  value: string;
  display_name: string;
}

// The AWX role_definitions OPTIONS request has a different response structure than EDA
type ContentTypeOptionTuple = [string, string];

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
    service === 'awx'
      ? awxAPI`/role_definitions/`
      : service === 'eda'
        ? edaAPI`/role_definitions/`
        : hubAPI`/_ui/v2/role_definitions/`;
  const roleUserAssignmentsURL =
    service === 'awx'
      ? awxAPI`/role_user_assignments/`
      : service === 'eda'
        ? edaAPI`/role_user_assignments/`
        : hubAPI`/_ui/v2/role_user_assignments/`;
  const roleTeamAssignmentsURL =
    service === 'awx'
      ? awxAPI`/role_team_assignments/`
      : service === 'eda'
        ? edaAPI`/role_team_assignments/`
        : hubAPI`/_ui/v2/role_team_assignments/`;
  const { data, isLoading } = useOptions<{
    actions: { POST: { content_type: { choices: ContentTypeOption[] } } };
  }>(roleDefinitionsURL);
  const getLinkToResourcePage = useGetLinkToResourcePage();

  // This filter applies to a user/team's roles list to filter based on the resource types
  const contentTypeFilterOptions = useMemo(() => {
    const options: ContentTypeOption[] | ContentTypeOptionTuple[] =
      data?.actions?.POST?.content_type?.choices || [];
    const optionsArray: PageSelectOption<string>[] = [];
    (options as ContentTypeOption[] | ContentTypeOptionTuple[])?.forEach((option) => {
      if ((option as ContentTypeOption)?.value) {
        optionsArray.push({
          value:
            (option as ContentTypeOption).value.split('.').pop() ||
            (option as ContentTypeOption).value,
          label: getDisplayName((option as ContentTypeOption).value, { isTitleCase: true }),
        });
      } else if (option && (option as ContentTypeOptionTuple)[0] !== null) {
        optionsArray.push({
          value:
            (option as ContentTypeOptionTuple)[0].split('.').pop() ||
            (option as ContentTypeOptionTuple)[0],
          label: getDisplayName((option as ContentTypeOptionTuple)[0], { isTitleCase: true }),
        });
      }
    });
    return optionsArray;
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
              objectId:
                service === 'hub'
                  ? assignment.summary_fields?.content_object?.name
                  : assignment.object_id,
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
