/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { AccessTable } from '../../users/Users';

/**
 * TODO: AccessTable should be replaced with ResourceAccessList component
 * and then deleted (it's no longer used anywhere else)
 */
export function OrganizationAccess() {
  const params = useParams<{ id: string }>();
  return <AccessTable url={awxAPI`/organizations/${params.id ?? ''}/access_list/`} />;
}
