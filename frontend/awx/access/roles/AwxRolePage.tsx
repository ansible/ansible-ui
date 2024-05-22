/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { PageRoutedTabs } from '../../../common/PageRoutedTabs';
import { useGetItem } from '../../../common/crud/useGet';
import { AwxError } from '../../common/AwxError';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxRbacRole } from '../../interfaces/AwxRbacRole';
import { AwxRoute } from '../../main/AwxRoutes';

export function AwxRolePage(props: {
  breadcrumbLabelForPreviousPage?: string;
  backTabLabel?: string;
}) {
  const getPageUrl = useGetPageUrl();
  const { t } = useTranslation();
  const params = useParams<{ id: string; resourceType: string }>();
  const {
    data: role,
    error,
    refresh,
  } = useGetItem<AwxRbacRole>(awxAPI`/role_definitions/`, params.id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!role) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[
          {
            label: props.breadcrumbLabelForPreviousPage || t('Roles'),
            to: getPageUrl(AwxRoute.Roles),
          },
          { label: role?.name },
        ]}
      />
      <PageRoutedTabs
        backTab={{
          label: props.backTabLabel || t('Back to Roles'),
          page: AwxRoute.Roles,
          persistentFilterKey: 'awx-roles',
        }}
        tabs={[{ label: t('Details'), page: AwxRoute.RoleDetails }]}
        params={{ id: params.id ?? '', resourceType: params.resourceType ?? '' }}
      />
    </PageLayout>
  );
}
