import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DateTimeCell, ITableColumn, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { useDescriptionColumn, useNameColumn, useTypeColumn } from '../../../../common/columns';
import { Schedule } from '../../../interfaces/Schedule';
import { getScheduleResourceUrl } from './getScheduleResourceUrl';

export function useSchedulesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const nameClick = useCallback((schedule: Schedule) => getScheduleResourceUrl(schedule), []);
  type JobTypeLabel = {
    [key: string]: { [key: string]: string };
  };
  const jobTypeLabels: JobTypeLabel = useMemo(
    () => ({
      inventory_update: { name: t('Inventory Sync'), route: RouteObj.InventorySources },
      job: { name: t('Playbook Run'), route: RouteObj.JobTemplateDetails },
      project_update: { name: t('Source Control Update'), route: RouteObj.ProjectDetails },
      system_job: { name: t('Management Job'), route: RouteObj.ManagementJobs },
      workflow_job: { name: t('Workflow Job'), route: RouteObj.WorkflowJobTemplateDetails },
    }),
    [t]
  );
  const makeReadable: (item: Schedule) => string = useCallback(
    (schedule: Schedule) => {
      return jobTypeLabels[schedule.summary_fields.unified_job_template.unified_job_type].name;
    },
    [jobTypeLabels]
  );

  const typeColumn = useTypeColumn<Schedule>({
    ...options,
    makeReadable,
    sort: 'unified_job_template__polymorphic_ctype__model',
  });
  const nameColumn = useNameColumn({ ...options, onClick: nameClick });
  const descriptionColumn = useDescriptionColumn();
  const tableColumns = useMemo<ITableColumn<Schedule>[]>(
    () => [
      nameColumn,
      descriptionColumn,
      {
        header: t('Related resource'),
        sort: 'unified_job_template',
        cell: (sched) => (
          <TextCell
            text={sched.summary_fields.unified_job_template.name}
            onClick={() => {
              navigate(getScheduleResourceUrl(sched, 'details'));
            }}
          />
        ),
      },
      typeColumn,
      {
        header: t('Next run'),
        sort: 'next_run',
        cell: (sched) => <DateTimeCell format="date-time" value={sched.next_run} />,
      },
    ],
    [typeColumn, descriptionColumn, nameColumn, navigate, t]
  );
  return tableColumns;
}
