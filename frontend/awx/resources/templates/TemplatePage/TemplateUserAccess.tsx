import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { UserAccess } from '../../../../common/access/components/UserAccess';

export function TemplateUserAccess() {
  const params = useParams<{ id: string }>();
  return (
    <UserAccess
      service="awx"
      id={params.id || ''}
      type={'jobtemplate'}
      addRolesRoute={AwxRoute.JobTemplateAddUsers}
    />
  );
}
