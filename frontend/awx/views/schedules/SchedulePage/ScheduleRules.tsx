import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { CubesIcon } from '@patternfly/react-icons';

const createRoutes: { [key: string]: string } = {
  inventories: RouteObj.InventorySourceCreateScheduleRules,
  job_templates: RouteObj.JobTemplateCreateScheduleRules,
  workflow_job_templates: RouteObj.WorkflowJobTemplateCreateScheduleRules,
  projects: RouteObj.ProjectCreateScheduleRules,
};
export function ScheduleRules(props: { rrule?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id: string; schedule_id: string; source_id?: string }>();
  let createUrl: string;
  const resource_type = Object.keys(createRoutes).find((route) =>
    location.pathname.split('/').includes(route)
  );
  const rruleStringArray = props.rrule?.split(' ');
  const startInfo = rruleStringArray[1];
  const rruleInfo = rruleStringArray.filter((str) => (str.startsWith('RRULE') ? str : undefined));
  const view = {
    itemCount: rruleInfo.length,
    item: rruleInfo,
    tableColumns: [
      {
        header: t('Start Date'),
        cell: <TextCell text={startInfo} />,
      },
      {
        header: t('Rrule'),
        cell: (rrule: string) => <TextCell text={rrule} />,
      },
    ],
  };
  if (resource_type && params?.id && params.schedule_id) {
    if (resource_type === 'inventories' && params?.source_id) {
      createUrl = RouteObj.InventorySourceCreateScheduleRules.replace(':id', `${params.id}`)
        .replace(':source_id', `${params.source_id}`)
        .replace(':schedule_id', `${params.schedule_id}`);
    }
    createUrl = createRoutes[resource_type]
      .replace(':id', `${params.id}`)
      .replace(':schedule_id', `${params.schedule_id}`);
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Schedule Rules')}
        titleHelpTitle={t('Schedule Rules')}
        titleHelp={t('Create as many schedule rules as you need.')}
        titleDocLink="https://docs.ansible.com/automation-controller/latest/html/userguide/scheduling.html"
        description={t(
          'Scheule rules are a component of an overall schedule.  A schedule rule is used to determine when a schedule will run.  A schedule can have multiple rules.'
        )}
      />
      <PageTable<{ rrule: string }>
        // toolbarFilters={toolbarFilters}
        // toolbarActions={toolbarActions}
        // tableColumns={tableColumns}
        // rowActions={rowActions}
        errorStateTitle={t('Error loading schedules')}
        emptyStateTitle={t('No schedules yet')}
        emptyStateDescription={t('Please create a schedule by using the button below.')}
        emptyStateIcon={CubesIcon}
        emptyStateButtonText={t('Create schedule')}
        emptyStateButtonClick={() => navigate(createUrl)}
        {...view}
      />
    </PageLayout>
  );
}
