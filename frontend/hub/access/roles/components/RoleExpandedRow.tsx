import { ExpandableRowContent } from '@patternfly/react-table';
import { RolePermissions } from './RolePermissions';
import { Role } from '../Role';

export function RoleExpandedRow(props: { role: Role; showCustom?: boolean; showEmpty?: boolean }) {
  const { role, showCustom, showEmpty } = props;

  return (
    <ExpandableRowContent>
      <RolePermissions role={role} showCustom={showCustom} showEmpty={showEmpty} />
    </ExpandableRowContent>
  );
}
