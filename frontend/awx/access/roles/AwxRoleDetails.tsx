import { useParams } from 'react-router-dom';
import { PageDetails, PageDetailsFromColumns } from '../../../../framework';
import { AwxRole } from './AwxRoles';
import { useAwxRoleColumns } from './useAwxRoleColumns';
import { useAwxRoles } from './useAwxRoles';

export function AwxRoleDetails() {
  const columns = useAwxRoleColumns();
  const params = useParams<{ id: string; resourceType: string }>();
  const awxRoles = useAwxRoles();
  const role: AwxRole = {
    ...awxRoles[params.resourceType!]?.roles[params.id!],
    name: awxRoles[params.resourceType!]?.roles[params.id!].label,
    roleId: params.id!,
    resourceId: params.resourceType!,
    resource: awxRoles[params.resourceType!]?.name,
  };

  return (
    <PageDetails>
      <PageDetailsFromColumns<AwxRole> item={role} columns={columns} />
    </PageDetails>
  );
}
