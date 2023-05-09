import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn } from '../../../../../../framework';
import { useDescriptionColumn, useNameColumn, useTypeColumn } from '../../../../../common/columns';
import { Schedule } from '../../../../interfaces/Schedule';
import { getScheduleResourceUrl } from './ getScheduleResourceUrl';

export function useSchedulesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();

  const nameClick = useCallback((schedule: Schedule) => getScheduleResourceUrl(schedule), []);

  const makeReadable: (item: Schedule) => string = useCallback(
    (schedule: Schedule) => {
      type JobTypeLabel = {
        [key: string]: string;
      };
      const jobTypeLabels: JobTypeLabel = {
        inventory_update: t`Inventory Sync`,
        job: t`Playbook Run`,
        project_update: t`Source Control Update`,
        system_job: t`Management Job`,
        workflow_job: t`Workflow Job`,
      };
      return jobTypeLabels[schedule.summary_fields.unified_job_template.unified_job_type];
    },
    [t]
  );

  const typeColumn = useTypeColumn<Schedule>({ ...options, makeReadable });
  const nameColumn = useNameColumn({ ...options, onClick: nameClick });
  const descriptionColumn = useDescriptionColumn();
  const tableColumns = useMemo<ITableColumn<Schedule>[]>(
    () => [nameColumn, descriptionColumn, typeColumn],
    [typeColumn, descriptionColumn, nameColumn]
  );
  return tableColumns;
}
