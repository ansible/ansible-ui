import { ExpandableRowContent } from '@patternfly/react-table';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { EdaRole } from '../../../interfaces/EdaRole';
import { EdaRolePermissions } from './EdaRolePermissions';

export function EdaRoleExpandedRow(props: { role: EdaRole }) {
  const { role } = props;

  const { data: roleDetails } = useGet<EdaRole>(edaAPI`/roles/${role.id ?? ''}/`);

  return (
    <ExpandableRowContent>
      <EdaRolePermissions role={roleDetails} />
    </ExpandableRowContent>
  );
}
