import { useParams } from 'react-router-dom';
import { EdaRoute } from '../../../main/EdaRoutes';
import { ResourceAccess } from '../../../../common/access/components/ResourceAccess';
import { edaAPI } from '../../../common/eda-utils';
import { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';
import { useOptions } from '../../../../common/crud/useOptions';
import { useTranslation } from 'react-i18next';

export function EdaUserRoles(props: { id?: string; addRolesRoute?: string }) {
  const params = useParams<{ id: string }>();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(edaAPI`/users/${params.id ?? ''}/`);
  const { t } = useTranslation();

  const canEditUser = Boolean(
    data && data.actions && (data.actions['PUT'] || data.actions['PATCH'])
  );
  return (
    <ResourceAccess
      service="eda"
      id={props.id || params.id || ''}
      type="user-roles"
      addRolesRoute={props.addRolesRoute || EdaRoute.UserAddRoles}
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
