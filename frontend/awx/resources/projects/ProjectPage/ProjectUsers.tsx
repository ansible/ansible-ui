/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ResourceUserAccess } from '@ansible/common-ui/access/components/ResourceUserAccess';
import { useParams } from 'react-router';
import { AwxRoute } from '../../../main/AwxRoutes';
export function ProjectUsers() {
  const params = useParams<{ id: string }>();

  return (
    <ResourceUserAccess
      service={'awx'}
      id={params.id || ''}
      type={'awx.project'}
      addRolesRoute={AwxRoute.ProjectAddUsers}
      manageRoleRoute={AwxRoute.ProjectManageUsers}
    />
  );
}
