/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../../framework';
import { RoutedTabs, RoutedTab, PageBackTab } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../Routes';
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { AwxError } from '../../../common/AwxError';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';

export function NotificationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; }>();
  const { error, data: notification_template, refresh } = useGetItem<NotificationTemplate>('/api/v2/notification_templates', params.id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!notification_template) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={notification_template?.name}
        breadcrumbs={[
          { label: t('Notifications'), to: RouteObj.Notifications },
          { label: notification_template?.name },
        ]}
        headerActions={[]}
      />
      <RoutedTabs isLoading={!notification_template} baseUrl={RouteObj.NotificationPage}>
        <PageBackTab
          label={t('Back to Notifications')}
          url={RouteObj.Notifications}
          persistentFilterKey="notifications"
        />
        <RoutedTab label={t('Details')} url={RouteObj.NotificationDetails}>
        <PageNotImplemented />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}