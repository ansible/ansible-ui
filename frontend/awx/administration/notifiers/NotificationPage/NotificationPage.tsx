/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useNotifiersRowActions } from '../hooks/useNotifiersRowActions';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PageActions } from '../../../../../framework';
import { usePageNavigate } from '../../../../../framework';
import { useState } from 'react';
import { usePageAlertToaster } from '../../../../../framework';
import { StatusLabel } from '../../../../common/Status';

export function NotificationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const [testedNotificationId, setTestedNotificationId] = useState<number | undefined>(undefined);
  // set refresh interval to be faster when test is running
  const {
    error,
    data: notificationTemplate,
    refresh,
  } = useGetItem<NotificationTemplate>(awxAPI`/notification_templates`, params.id, { refreshInterval : testedNotificationId === undefined ? 5000 : 2000});

  const pageNavigate = usePageNavigate();

  const alertToaster = usePageAlertToaster();

  const getPageUrl = useGetPageUrl();
  const pageActions = useNotifiersRowActions(
    () => {
      pageNavigate(AwxRoute.NotificationTemplates);
    },
    undefined,
    (notificationId: number) => {
      setTestedNotificationId(notificationId);
    },
    'detail',
    testedNotificationId === undefined ? false : true
  );

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!notificationTemplate) return <LoadingPage breadcrumbs tabs />;

  // search for notification id
  if (setTestedNotificationId !== undefined) {
    const notifications = notificationTemplate.summary_fields?.recent_notifications;
    const notification = notifications.find(
      (notification) => notification.id === testedNotificationId
    );
    if (notification) {
      alertToaster.addAlert({
        variant: 'info',
        title: t('Notifier test result'),
        children: <StatusLabel status={notification.status} />,
      });
      setTestedNotificationId(undefined);
    }
  }

  return (
    <PageLayout>
      {testedNotificationId}
      <PageHeader
        title={notificationTemplate?.name}
        breadcrumbs={[
          { label: t('Notifiers'), to: getPageUrl(AwxRoute.NotificationTemplates) },
          { label: notificationTemplate?.name },
        ]}
        headerActions={
          <PageActions<NotificationTemplate>
            actions={pageActions}
            position={DropdownPosition.right}
            selectedItem={notificationTemplate}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Credential Types'),
          page: AwxRoute.NotificationTemplates,
          persistentFilterKey: 'credential-types',
        }}
        tabs={[{ label: t('Details'), page: AwxRoute.NotificationTemplateDetails }]}
        params={params}
        componentParams={{
          notificationTemplate,
          runningTest: testedNotificationId === undefined ? false : true,
        }}
      />
    </PageLayout>
  );
}
