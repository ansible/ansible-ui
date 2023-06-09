import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@patternfly/react-core';
import { ITableColumn } from '../../../../../framework';
import { StatusCell } from '../../../../common/Status';
import { RouteObj } from '../../../../Routes';

export function useProjectStatusColumn(options?: {
  tooltip?: string;
  tooltipAlt?: string;
  disableLinks?: boolean;
  disableSort?: boolean;
}) {
  const { t } = useTranslation();
  const column: ITableColumn<{
    type?: string;
    status?: string;
    summary_fields?: {
      last_job?: {
        id?: number;
      };
      current_job?: {
        id?: number;
      };
    };
  }> = useMemo(
    () => ({
      header: t('Status'),
      cell: (item) =>
        item.summary_fields?.current_job || item.summary_fields?.last_job ? (
          <Tooltip content={options?.tooltip ?? ''} position="top">
            <StatusCell
              status={item.status}
              to={RouteObj.JobOutput.replace(':job_type', item.type ? item.type : '').replace(
                ':id',
                (
                  item.summary_fields?.current_job?.id ??
                  item.summary_fields?.last_job?.id ??
                  ''
                ).toString()
              )}
              disableLinks={options?.disableLinks}
            />
          </Tooltip>
        ) : (
          <Tooltip content={options?.tooltipAlt ?? ''} position="top">
            <StatusCell status={item.status} />
          </Tooltip>
        ),
      sort: options?.disableSort ? undefined : 'status',
    }),
    [options?.disableSort, options?.disableLinks, options?.tooltip, options?.tooltipAlt, t]
  );
  return column;
}
