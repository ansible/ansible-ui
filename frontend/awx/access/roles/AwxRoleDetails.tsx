import {
  LoadingPage,
  PageDetail,
  PageDetails,
  PageDetailsFromColumns,
} from '@ansible/ansible-ui-framework';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AwxError } from '../../common/AwxError';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxRbacRole } from '../../interfaces/AwxRbacRole';
import { AwxRolePermissions } from './components/AwxRolePermissions';
import { useAwxRoleColumns } from './hooks/useAwxRoleColumns';

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
