import { useParams } from 'react-router-dom';
import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { useTranslation } from 'react-i18next';
import { HubRoute } from '../../main/HubRoutes';
import { useGetNamespaceAndUsersWithAccess } from '../hooks/useGetNamespaceAndUsersWithAccess';
import { HubError } from '../../common/HubError';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';

export function HubNamespaceTeamPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; teamname: string }>();
  const getPageUrl = useGetPageUrl();
  const { data, error, refresh, namespace } = useGetNamespaceAndUsersWithAccess(params.id ?? '');

  if (!data && !error) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }
  return (
    <PageLayout>
      <PageHeader
        title={params.teamname ?? ''}
        breadcrumbs={[
          { label: t('Namespaces'), to: getPageUrl(HubRoute.Namespaces) },
          {
            label: namespace?.name,
            to: getPageUrl(HubRoute.NamespaceDetails, { params: params }),
          },
          {
            label: t('Team Access'),
            to: getPageUrl(HubRoute.NamespaceTeamAccess, { params: params }),
          },
          { label: params.teamname },
        ]}
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to User Access'),
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
    </PageLayout>
  );
}
