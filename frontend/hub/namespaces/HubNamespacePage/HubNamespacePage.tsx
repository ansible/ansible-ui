import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { useGet } from '../../../common/crud/useGet';
import { HubRoute } from '../../HubRoutes';
import { HubItemsResponse } from '../../useHubView';
import { HubNamespace } from '../HubNamespace';
import { useHubNamespaceActions } from '../hooks/useHubNamespaceActions';
import { hubAPI } from '../../api/formatPath';
import { LoadingPage } from '../../../../framework';
import { HubError } from '../../common/HubError';

export function HubNamespacePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data, error, refresh } = useGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id ?? ''}`
  );

  let namespace: HubNamespace | undefined = undefined;
  if (data && data.data && data.data.length > 0) {
    namespace = data.data[0];
  }
  const getPageUrl = useGetPageUrl();
  const pageActions = useHubNamespaceActions();

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
          { label: namespace?.name },
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
        tabs={[
          {
            label: t('Details'),
            page: HubRoute.NamespaceDetails,
          },
          {
            label: t('CLI Configuration'),
            page: HubRoute.EditNamespace,
          },
        ]}
        params={{ id: namespace?.name }}
      />
    </PageLayout>
  );
}
