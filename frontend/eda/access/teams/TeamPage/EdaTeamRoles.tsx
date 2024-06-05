import { useParams } from 'react-router-dom';
import { ResourceAccess } from '../../../../common/access/components/ResourceAccess';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useTranslation } from 'react-i18next';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { edaAPI } from '../../../common/eda-utils';
import { LoadingPage } from '../../../../../framework';

export function EdaTeamRoles(props: { id?: string; addRolesRoute?: string }) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data, isLoading: isLoadingOptions } = useOptions<OptionsResponse<ActionsResponse>>(
    edaAPI`/teams/${params.id ?? ''}/`
  );

  const canEditTeam = Boolean(
    data && data.actions && (data.actions['PUT'] || data.actions['PATCH'])
  );

  if (isLoadingOptions) {
    return <LoadingPage />;
  }

  return (
    <ResourceAccess
      service={'eda'}
      id={props.id || params.id || ''}
      type="team-roles"
      addRolesRoute={props.addRolesRoute || EdaRoute.TeamAddRoles}
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
