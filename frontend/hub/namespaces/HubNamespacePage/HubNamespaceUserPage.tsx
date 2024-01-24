import { useParams } from 'react-router-dom';
import {
  ICatalogBreadcrumb,
  LoadingPage,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HubRoute } from '../../main/HubRoutes';
import { useGetNamespaceAndUsersWithAccess } from '../hooks/useGetNamespaceAndUsersWithAccess';
import { HubError } from '../../common/HubError';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';

export function HubNamespaceUserPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; username: string }>();
  const [breadcrumbs, setBreadcrumbs] = useState<ICatalogBreadcrumb[]>([]);
  const getPageUrl = useGetPageUrl();
  const { data, error, refresh, namespace } = useGetNamespaceAndUsersWithAccess(params.id ?? '');

  useEffect(() => {
    setBreadcrumbs([
      { label: t('Namespaces'), to: getPageUrl(HubRoute.Namespaces) },
      { label: namespace?.name, to: getPageUrl(HubRoute.NamespaceDetails, { params: params }) },
      { label: t('User access'), to: getPageUrl(HubRoute.NamespaceUserAccess, { params: params }) },
      { label: params.username },
    ]);
  }, [getPageUrl, namespace?.name, params, setBreadcrumbs, t]);

  if (!data && !error) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }
  return (
    <PageLayout>
      <PageHeader title={params.username ?? ''} breadcrumbs={breadcrumbs} />
      <PageRoutedTabs
        backTab={{
          label: t('Back to User Access'),
          page: HubRoute.NamespaceUserAccess,
          persistentFilterKey: 'namespace-user-access',
        }}
        tabs={[
          {
            label: t('Roles'),
            page: HubRoute.NamespaceUserAccessRoles,
          },
        ]}
        params={{ id: namespace?.name, username: params.username }}
      />
    </PageLayout>
  );
}
