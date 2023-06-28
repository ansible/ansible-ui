import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { RouteObj } from '../../../../Routes';
import { RoutedTabs, RoutedTab, PageBackTab } from '../../../../common/RoutedTabs';
import { useGetItem } from '../../../../common/crud/useGetItem';
import { AwxError } from '../../../common/AwxError';
import { Schedule } from '../../../interfaces/Schedule';
import { useSchedulesActions } from '../hooks/useSchedulesActions';
import { ScheduleDetails } from './ScheduleDetails';
import { ScheduleRules } from './ScheduleRules';
import { detailRoutes } from '../hooks/scheduleHelpers';

const rulesListRoutes: { [key: string]: string } = {
  inventory: RouteObj.InventorySourceScheduleRules,
  job_template: RouteObj.JobTemplateScheduleRules,
  workflow_job_template: RouteObj.WorkflowJobTemplateScheduleRules,
  project: RouteObj.ProjectScheduleRules,
};

export function SchedulePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams<{ id: string; source_id?: string; schedule_id: string }>();
  const {
    error,
    data: Schedule,
    refresh,
  } = useGetItem<Schedule>('/api/v2/schedules', params.schedule_id);
  const navigate = useNavigate();

  const resource_type = Object.keys(rulesListRoutes).find((route) =>
    location.pathname.split('/').includes(route)
  );

  const itemActions = useSchedulesActions({
    onScheduleToggleorDeleteCompleted: () => navigate(RouteObj.Schedules), // handle routing to the right schedules list
  });

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!Schedule) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={Schedule?.name}
        breadcrumbs={[{ label: t('Schedules'), to: RouteObj.Templates }, { label: Schedule?.name }]}
        headerActions={
          <PageActions<Schedule>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={Schedule}
          />
        }
      />
      <RoutedTabs isLoading={!Schedule} baseUrl={RouteObj.JobTemplateSchedules}>
        <PageBackTab
          label={t('Back to Schedules')}
          url={RouteObj.JobTemplateSchedules.replace(':id', params.id as string)}
          persistentFilterKey="schedules"
        />

        <RoutedTab label={t('Details')} url={RouteObj.JobTemplateScheduleDetails}>
          <ScheduleDetails schedule={Schedule} />
        </RoutedTab>

        <RoutedTab
          label={t(`Rules`)}
          url={resource_type ? rulesListRoutes[resource_type] : RouteObj.Schedules}
        >
          <ScheduleRules rrule={Schedule.rrule} />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}
