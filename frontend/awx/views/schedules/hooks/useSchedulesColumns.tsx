import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DateTimeCell, ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import { useDescriptionColumn, useNameColumn, useTypeColumn } from '../../../../common/columns';
import { Schedule } from '../../../interfaces/Schedule';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useSchedulesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const getPageUrl = useGetPageUrl();

  type JobTypeLabel = {
    [key: string]: { [key: string]: string };
  };
  const jobTypeLabels: JobTypeLabel = useMemo(
    () => ({
      inventory_update: {
        name: t('Inventory sync'),
        scheduleDetailsRoute: getPageUrl(AwxRoute.InventorySourceScheduleDetails),
        resourceDetailsRoute: getPageUrl(AwxRoute.InventorySourceDetail),
      },
      job: {
        name: t('Playbook run'),
        scheduleDetailsRoute: getPageUrl(AwxRoute.JobTemplateScheduleDetails),
        resourceDetailsRoute: getPageUrl(AwxRoute.JobTemplateDetails),
      },
      project_update: {
        name: t('Source control update'),
        scheduleDetailsRoute: getPageUrl(AwxRoute.ProjectScheduleDetails),
        resourceDetailsRoute: getPageUrl(AwxRoute.ProjectDetails),
      },
      system_job: {
        name: t('Management job'),
        scheduleDetailsRoute: getPageUrl(AwxRoute.ManagementJobScheduleDetails),
        resourceDetailsRoute: getPageUrl(AwxRoute.ManagementJobs),
      },
      workflow_job: {
        name: t('Workflow job'),
        scheduleDetailsRoute: getPageUrl(AwxRoute.WorkflowJobTemplateScheduleDetails),
        resourceDetailsRoute: getPageUrl(AwxRoute.WorkflowJobTemplateDetails),
      },
    }),
    [getPageUrl, t]
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
        cell: (sched) => <DateTimeCell value={sched.next_run} />,
      },
    ],
    [typeColumn, descriptionColumn, jobTypeLabels, nameColumn, navigate, t]
  );
  return tableColumns;
}
