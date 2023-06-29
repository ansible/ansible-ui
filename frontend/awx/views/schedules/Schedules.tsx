import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { Schedule } from '../../interfaces/Schedule';
import { useAwxView } from '../../useAwxView';
import { useSchedulesActions } from './hooks/useSchedulesActions';
import { useSchedulesColumns } from './hooks/useSchedulesColumns';
import { useSchedulesFilter } from './hooks/useSchedulesFilter';
import { useScheduleToolbarActions } from './hooks/useSchedulesToolbarActions';
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { CubesIcon } from '@patternfly/react-icons';
import { useGetSchedulCreateUrl } from './hooks/scheduleHelpers';

export function Schedules(props: { sublistEndpoint?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const toolbarFilters = useSchedulesFilter();
  const tableColumns = useSchedulesColumns();
  const view = useAwxView<Schedule>({
    url: props.sublistEndpoint ?? '/api/v2/schedules/',
    toolbarFilters,
    tableColumns,
  });
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    props.sublistEndpoint ?? '/api/v2/schedules/'
  );
  const canCreateSchedule = Boolean(data && data.actions && data.actions['POST']);
  const createUrl = useGetSchedulCreateUrl(props?.sublistEndpoint);
  const toolbarActions = useScheduleToolbarActions(
    view.unselectItemsAndRefresh,
    props?.sublistEndpoint
  );
  const rowActions = useSchedulesActions({
    onScheduleToggleorDeleteCompleted: () => void view.refresh(),
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
