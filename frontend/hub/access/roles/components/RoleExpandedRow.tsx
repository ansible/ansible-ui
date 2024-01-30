import { ExpandableRowContent } from '@patternfly/react-table';
import { RolePermissions } from './RolePermissions';
import { Role } from '../Role';
import { HubAccessRole } from '../../resource-access/HubResourceAccessInterfaces';
import { useGet } from '../../../../common/crud/useGet';
import { PulpItemsResponse } from '../../../common/useHubView';
import { HubError } from '../../../common/HubError';
import { LoadingPage } from '../../../../../framework';
import { pulpAPI } from '../../../common/api/formatPath';

export function RoleExpandedRow(props: {
  role: Role | HubAccessRole;
  showCustom?: boolean;
  showEmpty?: boolean;
}) {
  const { role, showCustom, showEmpty } = props;

  const { data, error, refresh } = useGet<PulpItemsResponse<Role>>(
    pulpAPI`/roles/?name=${role.name || ''}`
  );
  const roleDetails = data?.results?.[0];
  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (!roleDetails) return <LoadingPage breadcrumbs tabs />;

  return (
    <ExpandableRowContent>
      <RolePermissions role={roleDetails} showCustom={showCustom} showEmpty={showEmpty} />
    </ExpandableRowContent>
  );
}
