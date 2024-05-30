/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { UserAccess } from '../../../../common/access/components/UserAccess';
export function ProjectUsers() {
  const params = useParams<{ id: string }>();

  return (
    <UserAccess
      service={'awx'}
      id={params.id || ''}
      type={'project'}
      addRolesRoute={AwxRoute.ProjectAddUsers}
    />
  );
}
