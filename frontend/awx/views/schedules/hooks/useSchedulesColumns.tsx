import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTimeCell, ITableColumn, TextCell } from '../../../../../framework';
import { useDescriptionColumn, useNameColumn, useTypeColumn } from '../../../../common/columns';
import { Schedule } from '../../../interfaces/Schedule';
import { useNavigate } from 'react-router-dom';
import { RouteObj } from '../../../../Routes';

export function useSchedulesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  type JobTypeLabel = {
    [key: string]: { [key: string]: string };
  };
  const jobTypeLabels: JobTypeLabel = useMemo(
    () => ({
      inventory_update: {
        name: t('Inventory Sync'),
        scheduleDetailsRoute: RouteObj.InventorySourceScheduleDetails,
        resourceDetailsRoute: RouteObj.InventoriesSourcesDetails,
      },
      job: {
        name: t('Playbook Run'),
        scheduleDetailsRoute: RouteObj.JobTemplateScheduleDetails,
        resourceDetailsRoute: RouteObj.JobTemplateDetails,
      },
      project_update: {
        name: t('Source Control Update'),
        scheduleDetailsRoute: RouteObj.ProjectScheduleDetails,
        resourceDetailsRoute: RouteObj.ProjectsDetails,
      },
      system_job: {
        name: t('Management Job'),
        scheduleDetailsRoute: RouteObj.ManagementJobSchedulesDetails,
        resourceDetailsRoute: RouteObj.ManagementJobs,
      },
      workflow_job: {
        name: t('Workflow Job'),
        scheduleDetailsRoute: RouteObj.WorkflowJobTemplateScheduleDetails,
        resourceDetailsRoute: RouteObj.WorkflowJobTemplateDetails,
      },
    }),
    [t]
  );

  const nameClick = useCallback(
    (schedule: Schedule) => {
      const isInventoryUpdate =
        schedule.summary_fields.unified_job_template.unified_job_type === 'inventory_update';
      return navigate(
        isInventoryUpdate && schedule.summary_fields.inventory
          ? jobTypeLabels[
              schedule.summary_fields.unified_job_template.unified_job_type
            ].scheduleDetailsRoute
              .replace(':id', schedule.summary_fields.inventory?.id.toString())
              .replace(':source_id', schedule.summary_fields.unified_job_template.id.toString())
              .replace(':schedule_id', schedule.id.toString())
          : jobTypeLabels[
              schedule.summary_fields.unified_job_template.unified_job_type
            ].scheduleDetailsRoute
              .replace(':id', schedule.summary_fields.unified_job_template.id.toString())
              .replace(':schedule_id', schedule.id.toString())
      );
    },
    [navigate, jobTypeLabels]
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
        cell: (schedule) => (
          <TextCell
            text={schedule.summary_fields.unified_job_template.name}
            onClick={() => {
              navigate(
                jobTypeLabels[
                  schedule.summary_fields.unified_job_template.unified_job_type
                ].resourceDetailsRoute.replace(
                  ':id',
                  schedule.summary_fields.unified_job_template.id.toString()
                )
              );
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
    [typeColumn, descriptionColumn, jobTypeLabels, nameColumn, navigate, t]
  );
  return tableColumns;
}
