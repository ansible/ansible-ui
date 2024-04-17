import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DateTimeCell, ITableColumn, TextCell } from '../../../../../framework';
import { useDescriptionColumn, useNameColumn, useTypeColumn } from '../../../../common/columns';
import { Schedule } from '../../../interfaces/Schedule';
import { useGetScheduleUrl } from './scheduleHelpers';
import { JobTypeLabel, ScheduleRoutes } from '../types';
import { UnifiedJobType } from '../../../resources/templates/WorkflowVisualizer/types';

export function useSchedulesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const jobTypeLabels: JobTypeLabel = useGetScheduleUrl({
    scheduleDetails: true,
    resourceDetails: true,
  } as ScheduleRoutes);

  const nameClick = useCallback(
    (schedule: Schedule) => {
      const unified_job_type = schedule.summary_fields.unified_job_template
        .unified_job_type as UnifiedJobType;
      const isInventoryUpdate = unified_job_type === 'inventory_update';
      const detailRoute = jobTypeLabels[unified_job_type]?.scheduleDetailsRoute as string;
      if (detailRoute === undefined) return '';
      return navigate(
        isInventoryUpdate && schedule.summary_fields.inventory
          ? detailRoute
              .replace(':id', schedule.summary_fields.inventory?.id.toString())
              .replace(':source_id', schedule.summary_fields.unified_job_template.id.toString())
              .replace(':schedule_id', schedule.id.toString())
          : detailRoute
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
                ]?.resourceDetailsRoute.replace(
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
