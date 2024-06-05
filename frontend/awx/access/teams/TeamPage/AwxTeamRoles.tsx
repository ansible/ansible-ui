import { useParams } from 'react-router-dom';
import { ResourceAccess } from '../../../../common/access/components/ResourceAccess';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { LoadingPage } from '../../../../../framework';
import { useTranslation } from 'react-i18next';

export function AwxTeamRoles(props: { id?: string; addRolesRoute?: string }) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data, isLoading: isLoadingOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/teams/${params.id ?? ''}/`
  );

  const canEditTeam = Boolean(
    data && data.actions && (data.actions['PUT'] || data.actions['PATCH'])
  );

  if (isLoadingOptions) {
    return <LoadingPage />;
  }

  return (
    <ResourceAccess
      service={'awx'}
      id={props.id || params.id || ''}
      type="team-roles"
      addRolesRoute={props.addRolesRoute || AwxRoute.AddRolesToTeam}
      disableAddRoles={
        canEditTeam
          ? undefined
          : t(
              'You do not have permission to add roles to this team. Please contact your system administrator if there is an issue with your access.'
            )
      }
    />
  );
}
