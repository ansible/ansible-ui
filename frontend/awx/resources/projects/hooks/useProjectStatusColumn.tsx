import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { StatusCell } from '@ansible/common-ui/Status';
import { Tooltip } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSyncJobId } from '../../../common/getSyncJobId';
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
    status?: string;
    summary_fields?: {
      last_job?: {
        id?: number;
      };
      current_job?: {
        id?: number;
      };
      current_update?: {
        id?: number;
      };
    };
    related?: {
      last_job?: string;
    };
  }> = useMemo(
    () => ({
      header: t('Status'),
      cell: (item) => {
        const jobId = getSyncJobId(item.summary_fields, item.related?.last_job);
        const jobOutputUrl =
          jobId !== undefined && !options?.disableLinks
            ? getPageUrl(AwxRoute.JobOutput, {
                params: {
                  job_type: 'project',
                  id: jobId,
                },
              })
            : undefined;

        return (
          <Tooltip
            content={jobOutputUrl ? (options?.tooltip ?? '') : (options?.tooltipAlt ?? '')}
            position="top"
          >
            <StatusCell
              status={item.status}
              to={jobOutputUrl}
              disableLinks={options?.disableLinks}
            />
          </Tooltip>
        );
      },
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
