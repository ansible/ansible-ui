import { DropdownPosition } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageBackTab, RoutedTab, RoutedTabs } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../common/Routes';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxError } from '../../../common/AwxError';
import { Schedule } from '../../../interfaces/Schedule';
import { useGetAwxUrl } from '../../../useAwxNavigate';
import {
  resourceSchedulePageRoutes,
  scheduleDetailRoutes,
  scheduleResourceTypeOptions,
  schedulesListRoutes,
} from '../hooks/scheduleHelpers';
import { useSchedulesActions } from '../hooks/useSchedulesActions';
import { ScheduleDetails } from './ScheduleDetails';
import { ScheduleRules } from './ScheduleRules';

const rulesListRoutes: { [key: string]: string } = {
  inventory: RouteObj.InventorySourceScheduleRules,
  job_template: RouteObj.JobTemplateScheduleRules,
  workflow_job_template: RouteObj.WorkflowJobTemplateScheduleRules,
  projects: RouteObj.ProjectScheduleRules,
};

export function SchedulePage() {
  const { t } = useTranslation();
  const getAwxUrl = useGetAwxUrl();
  const location = useLocation();
  const params = useParams<{ id: string; source_id?: string; schedule_id: string }>();
  const {
    error,
    data: schedule,
    refresh,
  } = useGetItem<Schedule>('/api/v2/schedules', params.schedule_id);
  const navigate = useNavigate();

  const resource_type = scheduleResourceTypeOptions.find((route) =>
    location.pathname.split('/').includes(route)
  );

  const itemActions = useSchedulesActions({
    onScheduleToggleorDeleteCompleted: () => navigate(getAwxUrl(AwxRoute.Schedules)),
  });
  const generateBackToSchedulesUrl: string = useMemo(() => {
    if (!resource_type || !schedule) return getAwxUrl(AwxRoute.Schedules);
    if (resource_type === 'inventory' && schedule?.summary_fields.inventory) {
      return RouteObj.InventorySourceSchedules.replace(':inventory_type', resource_type as string)
        .replace(':id', schedule.summary_fields.inventory.id.toString())
        .replace(':source_id', schedule.summary_fields.unified_job_template.id.toString());
    }
    return schedulesListRoutes[resource_type].replace(
      ':id',
      schedule.summary_fields?.unified_job_template.id.toString()
    );
  }, [getAwxUrl, resource_type, schedule]);
  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!schedule) return <LoadingPage breadcrumbs tabs />;
  return (
    <PageLayout>
      <PageHeader
        title={schedule?.name}
        breadcrumbs={[{ label: t('Schedules'), to: RouteObj.Templates }, { label: schedule?.name }]}
        headerActions={
          <PageActions<Schedule>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={schedule}
          />
        }
      />
      <RoutedTabs
        isLoading={!schedule}
        baseUrl={
          resource_type ? resourceSchedulePageRoutes[resource_type] : RouteObj.ScheduleDetails
        }
      >
        <PageBackTab
          label={t('Back to Schedules')}
          url={generateBackToSchedulesUrl}
          persistentFilterKey={resource_type ? `${resource_type}-schedules` : 'schedules'}
        />
        <RoutedTab
          label={t('Details')}
          url={resource_type ? scheduleDetailRoutes[resource_type] : getAwxUrl(AwxRoute.Schedules)}
        >
          <ScheduleDetails schedule={schedule} />
        </RoutedTab>
        <RoutedTab
          label={t(`Rules`)}
          url={resource_type ? rulesListRoutes[resource_type] : getAwxUrl(AwxRoute.Schedules)}
        >
          <ScheduleRules rrule={schedule.rrule} />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}
