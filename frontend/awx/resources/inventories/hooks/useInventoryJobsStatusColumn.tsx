import { Tooltip } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, useGetPageUrl } from '../../../../../framework';
import { StatusCell } from '../../../../common/Status';
import { AwxRoute } from '../../../main/AwxRoutes';
import { Job } from '../../../interfaces/Job';

export function useInventoryJobsStatusColumn(options?: {
  tooltip?: string;
  tooltipAlt?: string;
  disableLinks?: boolean;
  disableSort?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const column: ITableColumn<Job> = useMemo(
    () => ({
      header: t('Status'),
      cell: (item) =>
        item.status ? (
          <Tooltip content={options?.tooltip ?? ''} position="top">
            <StatusCell
              status={item.status}
              to={getPageUrl(AwxRoute.JobOutput, {
                params: {
                  job_type: 'playbook',
                  id: item.id,
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
