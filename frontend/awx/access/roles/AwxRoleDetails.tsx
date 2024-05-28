import { useParams } from 'react-router-dom';
import { PageDetails, PageDetailsFromColumns, LoadingPage } from '../../../../framework';
import { useGetItem } from '../../../common/crud/useGet';
import { AwxRbacRole } from '../../interfaces/AwxRbacRole';
import { useAwxRoleColumns } from './useAwxRoleColumns';
import { AwxError } from '../../common/AwxError';
import { awxAPI } from '../../common/api/awx-utils';

export function AwxRoleDetails() {
  const columns = useAwxRoleColumns();
  const params = useParams<{ id: string }>();
  const {
    data: role,
    error,
    refresh,
  } = useGetItem<AwxRbacRole>(awxAPI`/role_definitions/`, params.id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!role) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageDetails>
      <PageDetailsFromColumns<AwxRbacRole> item={role} columns={columns} />
    </PageDetails>
  );
}
