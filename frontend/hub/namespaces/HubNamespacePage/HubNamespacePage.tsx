import {
  IPageAction,
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { HubError } from '../../common/HubError';
import { hubAPI } from '../../common/api/formatPath';
import { isInsightsMode } from '../../common/isInsights';
import { HubItemsResponse } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { HubNamespace } from '../HubNamespace';
import { useHubNamespaceActions } from '../hooks/useHubNamespaceActions';

export function HubNamespacePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data, error, refresh } = useGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id}`
  );

  let namespace: HubNamespace | undefined = undefined;
  if (data && data.data.length > 0) {
    namespace = data.data[0];
  }

  // In Insights mode, check if user has access to this namespace via my-namespaces API
  // If the namespace is not in my-namespaces (404), the user cannot edit/delete it
  // Skip this API call in Platform mode since it's not needed there
  const { data: myNamespace } = useGet<HubNamespace>(
    isInsightsMode() && params?.id ? hubAPI`/_ui/v1/my-namespaces/${params.id}/` : ''
  );
  const showControls = !!myNamespace;

  const getPageUrl = useGetPageUrl();
  const allPageActions = useHubNamespaceActions({
    onHubNamespacesDeleted: () => pageNavigate(HubRoute.Namespaces),
    onHubNamespacesSignAllCollections: () =>
      pageNavigate(HubRoute.NamespaceCollections, {
        params: { id: namespace?.name ?? '' },
      }),
    isDetailsPageAction: true,
  });

  // In Insights mode, hide namespace actions if user doesn't have access to this namespace
  // This matches the legacy ansible-hub-ui behavior
  const pageActions = useMemo<IPageAction<HubNamespace>[]>(() => {
    if (isInsightsMode() && !showControls) {
      return [];
    }
    return allPageActions;
  }, [allPageActions, showControls]);

  if (!data && !error) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  return (
    <PageLayout>
      <PageHeader
        title={namespace?.name}
        breadcrumbs={[
          {
            label: isInsightsMode() ? t('Partners') : t('Namespaces'),
            to: getPageUrl(HubRoute.Namespaces),
          },
          { label: namespace?.name },
        ]}
        headerActions={
          <PageActions<HubNamespace>
            actions={pageActions}
            position={'right'}
            selectedItem={namespace}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: isInsightsMode() ? t('Back to Partners') : t('Back to Namespaces'),
          page: HubRoute.Namespaces,
          persistentFilterKey: 'name', // TODO add correct filters
        }}
        tabs={[
          {
            label: t('Details'),
            page: HubRoute.NamespaceDetails,
            dataCy: 'namespace-details-tab',
          },
          {
            label: t('Collections'),
            page: HubRoute.NamespaceCollections,
            dataCy: 'collections-tab',
          },
          {
            label: t('CLI Configuration'),
            page: HubRoute.NamespaceCLI,
            dataCy: 'namespace-cli-tab',
          },
          // In Insights mode, show a single "Access" tab using namespace-embedded data
          // In platform mode, show separate Team/User Access tabs using Gateway API
          ...(isInsightsMode()
            ? [{ label: t('Access'), page: HubRoute.NamespaceAccess }]
            : [
                { label: t('Team Access'), page: HubRoute.NamespaceTeamAccess },
                { label: t('User Access'), page: HubRoute.NamespaceUserAccess },
              ]),
        ]}
        params={{ id: namespace?.name }}
      />
    </PageLayout>
  );
}
