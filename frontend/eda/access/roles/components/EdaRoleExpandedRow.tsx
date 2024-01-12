import { ExpandableRowContent } from '@patternfly/react-table';
import { EdaRole } from '../../../interfaces/EdaRole';
import { EdaRolePermissions } from './EdaRolePermissions';
import { useGet } from '../../../../common/crud/useGet';
import { SWR_REFRESH_INTERVAL } from '../../../common/eda-constants';
import { edaAPI } from '../../../common/eda-utils';

export function EdaRoleExpandedRow(props: { role: EdaRole }) {
  const { role } = props;

  const { data: roleDetails } = useGet<EdaRole>(edaAPI`/roles/${role.id ?? ''}/`, undefined, {
    refreshInterval: SWR_REFRESH_INTERVAL,
  });

  return (
    <ExpandableRowContent>
      <EdaRolePermissions role={roleDetails} />
    </ExpandableRowContent>
  );
}
