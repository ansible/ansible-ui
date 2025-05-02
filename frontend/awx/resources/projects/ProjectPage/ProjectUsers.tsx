/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { UserAccess } from '@ansible/common-ui/access/components/UserAccess';
import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';
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
