import { useParams } from 'react-router-dom';
import {
  ICatalogBreadcrumb,
  LoadingPage,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import { BreadcrumbsContext } from '../../../../framework/hooks/usePageBreadcrumbsContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HubRoute } from '../../main/HubRoutes';
import { useGetNamespaceAndUsersWithAccess } from '../hooks/useGetNamespaceAndUsersWithAccess';
import { HubError } from '../../common/HubError';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';

export function HubNamespaceTeamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; teamname: string }>();
  const [breadcrumbs, setBreadcrumbs] = useState<ICatalogBreadcrumb[]>([]);
  const getPageUrl = useGetPageUrl();
  const { data, error, refresh, namespace } = useGetNamespaceAndUsersWithAccess(params.id ?? '');

  useEffect(() => {
    setBreadcrumbs([
      { label: t('Namespaces'), to: getPageUrl(HubRoute.Namespaces) },
      { label: namespace?.name, to: getPageUrl(HubRoute.NamespaceDetails, { params: params }) },
      { label: t('Team access'), to: getPageUrl(HubRoute.NamespaceTeamAccess, { params: params }) },
      { label: params.teamname },
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
      <BreadcrumbsContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
        <PageHeader title={params.teamname ?? ''} breadcrumbs={breadcrumbs} />
        <PageRoutedTabs
          backTab={{
            label: t('Back to user access'),
            page: HubRoute.NamespaceTeamAccess,
            persistentFilterKey: 'namespace-user-access',
          }}
          tabs={[
            {
              label: t('Roles'),
              page: HubRoute.NamespaceTeamAccessRoles,
            },
          ]}
          params={{ id: namespace?.name, teamname: params.teamname }}
        />
      </BreadcrumbsContext.Provider>
    </PageLayout>
  );
}
