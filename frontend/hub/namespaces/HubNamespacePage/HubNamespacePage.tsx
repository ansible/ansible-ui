import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { hubAPI } from '../../common/api/formatPath';
import { HubItemsResponse } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { HubNamespace } from '../HubNamespace';
import { useHubNamespaceActions } from '../hooks/useHubNamespaceActions';
import { useMemo } from 'react';

export function HubNamespacePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data, error, refresh } = useGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id}`
  );

  const namespace = useMemo<HubNamespace | undefined>(() => {
    if (data && data.data && data.data.length > 0) {
      return data.data[0];
    }
    return undefined;
  }, [data]);

  const getPageUrl = useGetPageUrl();
  const pageActions = useHubNamespaceActions({
    onHubNamespacesDeleted: () => pageNavigate(HubRoute.Namespaces),
  });

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
          { label: t('Namespaces'), to: getPageUrl(HubRoute.Namespaces) },
          {
            label: namespace?.name,
            to: getPageUrl(HubRoute.NamespaceDetails, { params: params }),
          },
        ]}
        headerActions={
          <PageActions<HubNamespace>
            actions={pageActions}
            position={DropdownPosition.right}
            selectedItem={namespace}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Namespaces'),
          page: HubRoute.Namespaces,
          persistentFilterKey: 'namespaces',
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
          {
            label: t('User Access'),
            page: HubRoute.NamespaceUserAccess,
          },
          {
            label: t('Team Access'),
            page: HubRoute.NamespaceTeamAccess,
          },
        ]}
        params={{ id: namespace?.name }}
      />
    </PageLayout>
  );
}
