/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { PageBackTab, RoutedTab, RoutedTabs } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../common/Routes';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxError } from '../../../common/AwxError';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { Schedules } from '../../../views/schedules/Schedules';
import { useTemplateActions } from '../hooks/useTemplateActions';
import { TemplateDetails } from './TemplateDetails';

export function TemplatePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: template,
    refresh,
  } = useGetItem<JobTemplate>('/api/v2/job_templates', params.id);
  const navigate = useNavigate();
  const itemActions = useTemplateActions({
    onTemplatesDeleted: () => navigate(RouteObj.Templates),
  });

  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!template) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={template?.name}
        breadcrumbs={[
          { label: t('Templates'), to: getPageUrl(AwxRoute.Templates) },
          { label: template?.name },
        ]}
        headerActions={
          <PageActions<JobTemplate>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={template}
          />
        }
      />
      <RoutedTabs isLoading={!template} baseUrl={RouteObj.JobTemplatePage}>
        <PageBackTab
          label={t('Back to Templates')}
          url={RouteObj.Templates}
          persistentFilterKey="templates"
        />
        <RoutedTab label={t('Details')} url={RouteObj.JobTemplateDetails}>
          <TemplateDetails template={template} />
        </RoutedTab>
        <RoutedTab label={t('Access')} url={RouteObj.JobTemplateAccess}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Notifications')} url={RouteObj.JobTemplateNotifications}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Schedules')} url={RouteObj.JobTemplateSchedules}>
          <Schedules sublistEndpoint={`/api/v2/job_templates/${template.id}/schedules/`} />
        </RoutedTab>
        <RoutedTab label={t('Jobs')} url={RouteObj.JobTemplateJobs}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Survey')} url={RouteObj.JobTemplateSurvey}>
          <PageNotImplemented />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}
