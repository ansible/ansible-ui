import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTimeCell, ITableColumn, TextCell, usePageNavigate } from '../../../../../framework';
import { useDescriptionColumn, useNameColumn, useTypeColumn } from '../../../../common/columns';
import { Schedule } from '../../../interfaces/Schedule';
import { useGetScheduleUrl } from './useGetScheduleUrl';
import { schedulePageUrl } from '../types';

export function useSchedulesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();

  const getScheduleUrl = useGetScheduleUrl();
  const pageNavigate = usePageNavigate();

  const typeColumn = useTypeColumn<Schedule>({
    ...options,
    makeReadable: (schedule: Schedule) => getScheduleUrl('name', schedule) as string,
    sort: 'unified_job_template__polymorphic_ctype__model',
  });
  const nameClick = useCallback(
    (schedule: Schedule) => {
      const pageUrl = getScheduleUrl('details', schedule) as schedulePageUrl;
      return pageNavigate(pageUrl.pageId, { params: pageUrl.params });
    },
    [getScheduleUrl, pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const relatedNameClick = useCallback(
    (schedule: Schedule) => {
      const pageUrl = getScheduleUrl('resource', schedule) as schedulePageUrl;
      return pageNavigate(pageUrl.pageId, { params: pageUrl.params });
    },
    [getScheduleUrl, pageNavigate]
  );
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
            onClick={() => relatedNameClick(schedule)}
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
    [nameColumn, descriptionColumn, t, typeColumn, relatedNameClick]
  );
  return tableColumns;
}
