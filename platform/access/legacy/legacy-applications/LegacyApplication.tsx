import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { LoadingPage } from '@ansible/ansible-ui-framework/components/LoadingPage';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useLegacyApplicationActions } from './hooks/useLegacyApplicationActions';

export function LegacyApplication() {
  const { t } = useTranslation();
  const params = useParams<{ applicationId: string }>();
  const {
    error,
    data: application,
    refresh,
  } = useGetItem<Application>(awxAPI`/applications/`, params.applicationId);

  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();

  const itemActions = useLegacyApplicationActions({
    onApplicationsDeleted: () => pageNavigate(PlatformRoute.LegacyApplications),
  });

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!application) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={application?.name}
        breadcrumbs={[
          { label: t('Legacy Applications'), to: getPageUrl(PlatformRoute.LegacyApplications) },
          { label: application?.name },
        ]}
        headerActions={
          <PageActions actions={itemActions} position={'right'} selectedItem={application} />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Applications'),
          page: PlatformRoute.LegacyApplications,
          persistentFilterKey: 'applications',
        }}
        tabs={[
          { label: t('Details'), page: PlatformRoute.LegacyApplicationDetails },
          { label: t('Tokens'), page: PlatformRoute.LegacyApplicationTokens },
        ]}
        params={{ applicationId: application.id }}
      />
    </PageLayout>
  );
}
