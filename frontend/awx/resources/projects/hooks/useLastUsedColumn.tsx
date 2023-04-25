import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ColumnModalOption,
  ColumnTableOption,
  DateTimeCell,
  ITableColumn,
} from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { Project } from '../../../interfaces/Project';

export function useLastUsedColumn() {
  const { t } = useTranslation();
  const history = useNavigate();
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
                    history(
                      RouteObj.UserDetails.replace(
                        ':id',
                        (item.summary_fields?.modified_by?.id ?? 0).toString()
                      )
                    )
            }
          />
        );
      },
      table: ColumnTableOption.Expanded,
      card: 'hidden',
      list: 'secondary',
      modal: ColumnModalOption.Hidden,
    }),
    [history, t]
  );
  return column;
}
