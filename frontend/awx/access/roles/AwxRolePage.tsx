/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageDetailsFromColumns,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import { AwxRoute } from '../../AwxRoutes';
import { AwxRole } from './AwxRoles';
import { useAwxRoleColumns } from './useAwxRoleColumns';
import { useAwxRoles } from './useAwxRoles';

export function AwxRolePage() {
  const params = useParams<{ id: string; resourceType: string }>();
  const awxRoles = useAwxRoles();
  const role: AwxRole = {
    ...awxRoles[params.resourceType!]?.roles[params.id!],
    name: awxRoles[params.resourceType!]?.roles[params.id!].label,
    roleId: params.id!,
    resourceId: params.resourceType!,
    resource: awxRoles[params.resourceType!]?.name,
  };
  const getPageUrl = useGetPageUrl();
  const columns = useAwxRoleColumns();
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[{ label: t('Roles'), to: getPageUrl(AwxRoute.Roles) }, { label: role?.name }]}
      />
      <PageDetailsFromColumns<AwxRole> item={role} columns={columns} />
    </PageLayout>
  );
}
