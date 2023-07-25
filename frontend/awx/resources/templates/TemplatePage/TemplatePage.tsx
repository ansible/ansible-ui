/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { RouteObj } from '../../../../Routes';
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { RoutedTabs, RoutedTab, PageBackTab } from '../../../../common/RoutedTabs';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { AwxError } from '../../../common/AwxError';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { useTemplateActions } from '../hooks/useTemplateActions';
import { TemplateDetails } from './TemplateDetails';
import { Schedules } from '../../../views/schedules/Schedules';

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

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!template) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={template?.name}
        breadcrumbs={[{ label: t('Templates'), to: RouteObj.Templates }, { label: template?.name }]}
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
