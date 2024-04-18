import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DateTimeCell, ITableColumn, TextCell } from '../../../../../framework';
import { useDescriptionColumn, useNameColumn, useTypeColumn } from '../../../../common/columns';
import { Schedule } from '../../../interfaces/Schedule';
import { useGetScheduleUrl } from './scheduleHelpers';

export function useSchedulesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getScheduleUrl = useGetScheduleUrl();

  const typeColumn = useTypeColumn<Schedule>({
    ...options,
    makeReadable: (schedule: Schedule) => getScheduleUrl('name', schedule),
    sort: 'unified_job_template__polymorphic_ctype__model',
  });
  const nameColumn = useNameColumn({
    ...options,
    onClick: (schedule: Schedule) => navigate(getScheduleUrl('details', schedule)),
  });
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
            onClick={() => navigate(getScheduleUrl('resource', schedule))}
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
    [nameColumn, descriptionColumn, t, typeColumn, navigate, getScheduleUrl]
  );
  return tableColumns;
}
