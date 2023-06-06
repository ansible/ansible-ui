/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../../framework';
import { RoutedTabs, RoutedTab, PageBackTab } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../Routes';
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { Application } from '../../../interfaces/Application';
import { AwxError } from '../../../common/AwxError';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';

export function ApplicationPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; }>();
  const { error, data: application, refresh } = useGetItem<Application>('/api/v2/applications', params.id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!application) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={application?.name}
        breadcrumbs={[
          { label: t('Applications'), to: RouteObj.Applications },
          { label: application?.name },
        ]}
        headerActions={[]}
      />
      <RoutedTabs isLoading={!application} baseUrl={RouteObj.ApplicationPage}>
        <PageBackTab
          label={t('Back to Applications')}
          url={RouteObj.Applications}
          persistentFilterKey="applications"
        />
        <RoutedTab label={t('Details')} url={RouteObj.ApplicationDetails}>
        <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Tokens')} url={RouteObj.ApplicationTokens}>
        <PageNotImplemented />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}