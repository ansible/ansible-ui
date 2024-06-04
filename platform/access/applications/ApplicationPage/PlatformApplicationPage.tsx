import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../../frontend/common/PageRoutedTabs';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { useApplicationActions } from '../hooks/useApplicationActions';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { Application } from '../../../../frontend/awx/interfaces/Application';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function PlatformApplicationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: application,
    refresh,
  } = useGetItem<Application>(gatewayV1API`/applications/`, params.id);

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
          <PageActions
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={application}
          />
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
