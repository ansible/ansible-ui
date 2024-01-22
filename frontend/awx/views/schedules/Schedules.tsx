import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { Schedule } from '../../interfaces/Schedule';
import { scheduleResourceTypeOptions, useGetSchedulCreateUrl } from './hooks/scheduleHelpers';
import { useSchedulesActions } from './hooks/useSchedulesActions';
import { useSchedulesColumns } from './hooks/useSchedulesColumns';
import { useSchedulesFilter } from './hooks/useSchedulesFilter';
import { useScheduleToolbarActions } from './hooks/useSchedulesToolbarActions';

export function Schedules(props: { sublistEndpoint?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id: string; source_id?: string }>();
  const location = useLocation();
  const toolbarFilters = useSchedulesFilter();
  const tableColumns = useSchedulesColumns();
  const resourceId = params.source_id ?? params.id;
  const apiEndPoint: string | undefined = props.sublistEndpoint
    ? `${props.sublistEndpoint}/${resourceId}/schedules/`
    : undefined;

  const view = useAwxView<Schedule>({
    url: apiEndPoint ?? awxAPI`/schedules/`,
    toolbarFilters,
    tableColumns,
  });

  const resource_type = scheduleResourceTypeOptions.find((route) =>
    location.pathname.split('/').includes(route)
  );
  usePersistentFilters(resource_type ? `${resource_type}-schedules` : 'schedules');

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(apiEndPoint ?? awxAPI`/schedules/`);
  const canCreateSchedule = Boolean(data && data.actions && data.actions['POST']);
  const createUrl = useGetSchedulCreateUrl(apiEndPoint);
  const toolbarActions = useScheduleToolbarActions(view.unselectItemsAndRefresh, apiEndPoint);
  const rowActions = useSchedulesActions({
    onScheduleToggleorDeleteCompleted: () => void view.refresh(),
    sublistEndpoint: apiEndPoint,
  });
  return (
    <PageLayout>
      <PageHeader
        title={t('Schedules')}
        titleHelpTitle={t('Schedule')}
        titleHelp={t(
          'Schedules are used to launch jobs on a regular basis. They can be used to launch jobs against machines, synchronize with inventory sources, and import project content from a version control system.'
        )}
        titleDocLink="https://docs.ansible.com/automation-controller/latest/html/userguide/scheduling.html"
        description={t(
          'Schedules are used to launch jobs on a regular basis. They can be used to launch jobs against machines, synchronize with inventory sources, and import project content from a version control system.'
        )}
      />
      <PageTable<Schedule>
        id="awx-schedules-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading schedules')}
        emptyStateTitle={
          canCreateSchedule
            ? t('No schedules yet')
            : t('You do not have permission to create a schedule')
        }
        emptyStateDescription={
          canCreateSchedule
            ? t('Please create a schedule by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateSchedule ? undefined : CubesIcon}
        emptyStateButtonText={canCreateSchedule ? t('Create schedule') : undefined}
        emptyStateButtonClick={canCreateSchedule ? () => navigate(createUrl) : undefined}
        {...view}
      />
    </PageLayout>
  );
}
