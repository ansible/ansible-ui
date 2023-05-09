import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { Schedule } from '../../interfaces/Schedule';
import { useAwxView } from '../../useAwxView';
import { useSchedulesActions } from './hooks/useSchedulesActions';
import { useSchedulesColumns } from './hooks/useSchedulesColumns';
import { useSchedulesFilter } from './hooks/useSchedulesFilter';
import { useScheduleToolbarActions } from './hooks/useSchedulesToolbarActions';

export function Schedules() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const toolbarFilters = useSchedulesFilter();
  const tableColumns = useSchedulesColumns();
  const view = useAwxView<Schedule>({
    url: '/api/v2/schedules/',
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useScheduleToolbarActions(view.unselectItemsAndRefresh);
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
        emptyStateTitle={t('No schedules yet')}
        emptyStateDescription={t('To get started, create a schedule.')}
        emptyStateButtonText={t('Create schedule')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateSchedule)}
        {...view}
      />
    </PageLayout>
  );
}
