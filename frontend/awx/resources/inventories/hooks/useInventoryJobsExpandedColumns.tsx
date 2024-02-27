import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
  usePageNavigate,
} from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { Job } from '../../../interfaces/Job';

export function useInventoryJobsExpandedColumns() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const column = useMemo<ITableColumn<Job>[]>(() => {
    const columnTemplate = (
      header: string,
      value: (job: Job) => string,
      navigate: string = '',
      params: (job: Job) => Record<string, string | number | undefined> = () => ({})
    ): ITableColumn<Job> => {
      return {
        header: t(header),
        value: value,
        cell: (item) => {
          if (!value(item)) return <></>;
          return (
            <TextCell
              text={value(item)}
              onClick={
                navigate !== ''
                  ? () =>
                      pageNavigate(navigate, {
                        params: params(item),
                      })
                  : undefined
              }
            />
          );
        },
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.hidden,
        dashboard: ColumnModalOption.hidden,
      };
    };

    return [
      columnTemplate(
        'Launched by',
        (job) => job?.launched_by?.name,
        AwxRoute.UserDetails,
        (job) => ({ id: job?.launched_by?.id })
      ),
      columnTemplate(
        'Project',
        (job) => job?.summary_fields?.project?.name ?? '',
        AwxRoute.ProjectDetails,
        (job) => ({ id: job?.summary_fields?.project?.id })
      ),
      columnTemplate(
        'Job Template',
        (job) => job?.summary_fields?.job_template?.name ?? '',
        AwxRoute.JobDetails,
        (job) => ({ id: job?.summary_fields?.job_template?.id })
      ),
      columnTemplate(
        'Execution Environment',
        (job) => job?.summary_fields?.execution_environment?.name ?? '',
        AwxRoute.ExecutionEnvironmentDetails,
        (job) => ({ id: job?.summary_fields?.execution_environment?.id })
      ),
      columnTemplate(
        'Inventory',
        (job) => job?.summary_fields?.inventory?.name ?? '',
        AwxRoute.InventoryDetails,
        (job) => ({ id: job?.summary_fields?.inventory?.id })
      ),
      columnTemplate('Job Slice', (job) => job?.job_slice_count?.toString() ?? ''),
    ];
  }, [pageNavigate, t]);

  return column;
}
