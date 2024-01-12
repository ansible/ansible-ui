/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { AwxRoute } from '../../main/AwxRoutes';
import { AwxRole } from './AwxRoles';
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
  const { t } = useTranslation();

  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[{ label: t('Roles'), to: getPageUrl(AwxRoute.Roles) }, { label: role?.name }]}
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Roles'),
          page: AwxRoute.Roles,
          persistentFilterKey: 'awx-roles',
        }}
        tabs={[{ label: t('Details'), page: AwxRoute.RoleDetails }]}
        params={{ id: params.id ?? '', resourceType: params.resourceType ?? '' }}
      />
    </PageLayout>
  );
}
