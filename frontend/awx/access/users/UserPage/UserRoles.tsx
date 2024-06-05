import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { ResourceAccess } from '../../../../common/access/components/ResourceAccess';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useTranslation } from 'react-i18next';

export function UserRoles(props: { id?: string; addRolesRoute?: string }) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/users/${params.id ?? ''}/`);

  const canEditUser = Boolean(
    data && data.actions && (data.actions['PUT'] || data.actions['PATCH'])
  );

  return (
    <ResourceAccess
      service="awx"
      id={props.id || params.id || ''}
      type="user-roles"
      addRolesRoute={props.addRolesRoute || AwxRoute.AddRolesToUser}
      disableAddRoles={
        canEditUser
          ? undefined
          : t(
              'You do not have permission to add roles to this user. Please contact your system administrator if there is an issue with your access.'
            )
      }
    />
  );
}
