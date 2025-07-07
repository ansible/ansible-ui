import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { hubAPI } from '@ansible/hub-ui/common/api/formatPath';
import { useTranslation } from 'react-i18next';
import { UserAssignment } from '../interfaces/UserAssignment';
import { Access } from './Access';
import { PlatformRoute } from '@ansible/platform-ui/main/PlatformRoutes';
import { useGetPageUrl } from '@ansible/ansible-ui-framework';

export function UserAccess(props: {
  service: 'awx' | 'eda' | 'hub';
  id: string;
  type: string;
  addRolesRoute?: string;
  addRoleButtonText?: string;
  removeRoleText?: string;
  removeConfirmationText?: (count: number) => string;
}) {
  const { type, service, ...rest } = props;
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const roleUserAssignmentsURL =
    service === 'awx'
      ? awxAPI`/role_user_assignments/`
      : service === 'eda'
        ? edaAPI`/role_user_assignments/`
        : hubAPI`/_ui/v2/role_user_assignments/`;
  return (
    <Access<UserAssignment>
      {...rest}
      service={service}
      tableColumnFunctions={{
        name: {
          function: (userAccess: UserAssignment) => userAccess?.summary_fields?.user?.username,
          sort: 'user__username',
          label: t('Username'),
          to: (userAccess: UserAssignment) =>
            getPageUrl(PlatformRoute.UserDetails, {
              params: { id: userAccess?.summary_fields?.user?.id },
            }),
        },
      }}
      additionalTableColumns={[
        {
          header: t('First name'),
          type: 'text',
          value: (item: UserAssignment) => item?.summary_fields?.user?.first_name,
          sort: 'user__first_name',
        },
        {
          header: t('Last name'),
          type: 'text',
          value: (item: UserAssignment) => item?.summary_fields?.user?.last_name,
          sort: 'user__last_name',
        },
      ]}
      toolbarNameColumnFiltersValues={{ label: t('Username'), query: 'user__username__icontains' }}
      url={roleUserAssignmentsURL}
      content_type_model={type}
      accessListType={'user'}
      addRoleButtonText={t('Assign users')}
    />
  );
}
