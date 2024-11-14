import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { LoadingPage } from '@ansible/ansible-ui-framework/components/LoadingPage';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { PageRoutedTabs } from '../../../../frontend/common/PageRoutedTabs';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useApplicationActions } from '../hooks/useApplicationActions';

export function PlatformApplicationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: application,
    refresh,
  } = useGetItem<Application>(gatewayAPI`/applications/`, params.id);

  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();

  const itemActions = useApplicationActions({
    onApplicationsDeleted: () => pageNavigate(PlatformRoute.Applications),
  });

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!application) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={application?.name}
        breadcrumbs={[
          { label: t('OAuth Applications'), to: getPageUrl(PlatformRoute.Applications) },
          { label: application?.name },
        ]}
        headerActions={
          <PageActions actions={itemActions} position={'right'} selectedItem={application} />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Applications'),
          page: PlatformRoute.Applications,
          persistentFilterKey: 'applications',
        }}
        tabs={[
          { label: t('Details'), page: PlatformRoute.ApplicationDetails },
          { label: t('Tokens'), page: PlatformRoute.ApplicationTokens },
        ]}
        params={{ id: application.id }}
      />
    </PageLayout>
  );
}
