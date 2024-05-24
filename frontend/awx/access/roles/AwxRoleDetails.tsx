import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PageDetails,
  PageDetail,
  PageDetailsFromColumns,
  LoadingPage,
} from '../../../../framework';
import { useGetItem } from '../../../common/crud/useGet';
import { AwxRbacRole } from '../../interfaces/AwxRbacRole';
import { useAwxRoleColumns } from './hooks/useAwxRoleColumns';
import { AwxRolePermissions } from './components/AwxRolePermissions';
import { AwxError } from '../../common/AwxError';
import { awxAPI } from '../../common/api/awx-utils';

export function AwxRoleDetails() {
  const { t } = useTranslation();
  const columns = useAwxRoleColumns({ disableLinks: true });
  const params = useParams<{ id: string }>();
  const {
    data: role,
    error,
    refresh,
  } = useGetItem<AwxRbacRole>(awxAPI`/role_definitions/`, params.id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!role) return <LoadingPage breadcrumbs tabs />;

  return (
    <>
      <PageDetails disableScroll>
        <PageDetailsFromColumns<AwxRbacRole> item={role} columns={columns} />
      </PageDetails>
      <PageDetails disableScroll numberOfColumns={'single'}>
        <PageDetail label={t('Permissions')}>
          <AwxRolePermissions role={role} />
        </PageDetail>
      </PageDetails>
    </>
  );
}
