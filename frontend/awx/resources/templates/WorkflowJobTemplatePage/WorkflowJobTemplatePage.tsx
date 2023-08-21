/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
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
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { PageBackTab, RoutedTab, RoutedTabs } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../common/Routes';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxError } from '../../../common/AwxError';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { Schedules } from '../../../views/schedules/Schedules';
import { WorkflowJobTemplateDetails } from './WorkflowJobTemplateDetails';
import { useTemplateActions } from '../hooks/useTemplateActions';

export function WorkflowJobTemplatePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: template,
    refresh,
  } = useGetItem<WorkflowJobTemplate>('/api/v2/workflow_job_templates', params.id);

  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const itemActions = useTemplateActions({
    onTemplatesDeleted: () => pageNavigate(AwxRoute.Templates),
  });
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
          <PageActions<WorkflowJobTemplate>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={template}
          />
        }
      />
      <RoutedTabs isLoading={!template} baseUrl={RouteObj.WorkflowJobTemplatePage}>
        <PageBackTab
          label={t('Back to Templates')}
          url={RouteObj.Templates}
          persistentFilterKey="templates"
        />
        <RoutedTab label={t('Details')} url={RouteObj.WorkflowJobTemplateDetails}>
          <WorkflowJobTemplateDetails template={template} />
        </RoutedTab>
        <RoutedTab label={t('Access')} url={RouteObj.WorkflowJobTemplateAccess}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Notifications')} url={RouteObj.WorkflowJobTemplateNotifications}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Schedules')} url={RouteObj.WorkflowJobTemplateSchedules}>
          <Schedules sublistEndpoint={`/api/v2/workflow_job_templates/${template.id}/schedules/`} />
        </RoutedTab>
        <RoutedTab label={t('Jobs')} url={RouteObj.WorkflowJobTemplateJobs}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Survey')} url={RouteObj.WorkflowJobTemplateSurvey}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Visualizer')} url={RouteObj.WorkflowJobTemplateVisualizer}>
          <PageNotImplemented />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}
