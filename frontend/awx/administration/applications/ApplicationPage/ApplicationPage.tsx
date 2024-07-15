import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { useViewActivityStream } from '../../../access/common/useViewActivityStream';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { Application } from '../../../interfaces/Application';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useApplicationActions } from '../hooks/useApplicationActions';

export function ApplicationPage() {
  const { t } = useTranslation();
  const activityStream = useViewActivityStream('o_auth2_application');
  const params = useParams<{ id: string }>();
  const {
    error,
    data: application,
    refresh,
  } = useGetItem<Application>(awxAPI`/applications`, params.id);

  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();

  const itemActions = useApplicationActions({
    onApplicationsDeleted: () => pageNavigate(AwxRoute.Applications),
  });

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!application) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={application?.name}
        breadcrumbs={[
          { label: t('OAuth Applications'), to: getPageUrl(AwxRoute.Applications) },
          { label: application?.name },
        ]}
        headerActions={
          <PageActions
            actions={[...activityStream, ...itemActions]}
            position={DropdownPosition.right}
            selectedItem={application}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to OAuth Applications'),
          page: AwxRoute.Applications,
          persistentFilterKey: 'applications',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.ApplicationDetails },
          { label: t('Tokens'), page: AwxRoute.ApplicationTokens },
        ]}
        params={{ id: application.id }}
      />
    </PageLayout>
  );
}
