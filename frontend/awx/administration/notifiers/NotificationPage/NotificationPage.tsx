/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useEffect } from 'react';
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
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useNotificationsWatch } from '../hooks/useNotificationsWatch';
import { useNotifiersRowActions } from '../hooks/useNotifiersRowActions';
import { useViewActivityStream } from '../../../access/common/useViewActivityStream';

export function NotificationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const activityStream = useViewActivityStream();
  const { runningNotifications, onNotifierStartTest, checkNotifiers } = useNotificationsWatch();

  // set refresh interval to be faster when test is running
  const {
    error,
    data: notificationTemplate,
    refresh,
  } = useGetItem<NotificationTemplate>(awxAPI`/notification_templates`, params.id, {
    refreshInterval: runningNotifications[params.id || ''] === undefined ? 5000 : 2000,
  });

  const pageNavigate = usePageNavigate();

  const getPageUrl = useGetPageUrl();
  const pageActions = useNotifiersRowActions({
    onComplete: () => {
      pageNavigate(AwxRoute.NotificationTemplates);
    },
    onNotifierStartTest,
    type: 'detail',
    runningNotifications,
  });

  useEffect(() => {
    if (notificationTemplate) {
      checkNotifiers([notificationTemplate]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationTemplate]);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!notificationTemplate) return <LoadingPage breadcrumbs tabs />;

  // search for notification id
  const notificationId = runningNotifications[notificationTemplate.id.toString()];

  return (
    <PageLayout>
      <PageHeader
        title={notificationTemplate?.name}
        breadcrumbs={[
          { label: t('Notifiers'), to: getPageUrl(AwxRoute.NotificationTemplates) },
          { label: notificationTemplate?.name },
        ]}
        headerActions={
          <PageActions<NotificationTemplate>
            actions={[...activityStream, ...pageActions]}
            position={DropdownPosition.right}
            selectedItem={notificationTemplate}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Notifiers'),
          page: AwxRoute.NotificationTemplates,
          persistentFilterKey: 'credential-types',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.NotificationTemplateDetails },
          { label: t('Team Access'), page: AwxRoute.NotificationTemplateTeamAccess },
          { label: t('User Access'), page: AwxRoute.NotificationTemplateUserAccess },
        ]}
        params={params}
        componentParams={{
          notificationTemplate,
          runningTest: notificationId === undefined ? false : true,
        }}
      />
    </PageLayout>
  );
}
