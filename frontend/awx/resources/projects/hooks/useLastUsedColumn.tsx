import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  DateTimeCell,
  ITableColumn,
  usePageNavigate,
} from '../../../../../framework';
import { AwxRoute } from '../../../AwxRoutes';
import { Project } from '../../../interfaces/Project';

export function useLastUsedColumn() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const column = useMemo<ITableColumn<Project>>(
    () => ({
      header: t('Last used'),
      value: (project) => project.last_job_run,
      cell: (item) => {
        if (!item.last_job_run) return <></>;
        return (
          <DateTimeCell
            format="since"
            value={item.last_job_run}
            author={
              'summary_fields' in item ? item.summary_fields?.modified_by?.username : undefined
            }
            onClick={
              !('summary_fields' in item)
                ? undefined
                : () =>
                    pageNavigate(AwxRoute.UserDetails, {
                      params: {
                        id: item.summary_fields?.modified_by?.id,
                      },
                    })
            }
          />
        );
      },
      table: ColumnTableOption.Expanded,
      card: 'hidden',
      list: 'secondary',
      modal: ColumnModalOption.Hidden,
    }),
    [pageNavigate, t]
  );
  return column;
}
