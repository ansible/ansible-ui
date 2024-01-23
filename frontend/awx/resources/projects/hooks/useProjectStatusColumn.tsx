import { Tooltip } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, useGetPageUrl } from '../../../../../framework';
import { StatusCell } from '../../../../common/Status';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useProjectStatusColumn(options?: {
  tooltip?: string;
  tooltipAlt?: string;
  disableLinks?: boolean;
  disableSort?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
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
              to={getPageUrl(AwxRoute.JobOutput, {
                params: {
                  job_type: item.type,
                  id: item.summary_fields?.current_job?.id ?? item.summary_fields?.last_job?.id,
                },
              })}
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
    [
      t,
      options?.disableSort,
      options?.tooltip,
      options?.disableLinks,
      options?.tooltipAlt,
      getPageUrl,
    ]
  );
  return column;
}
