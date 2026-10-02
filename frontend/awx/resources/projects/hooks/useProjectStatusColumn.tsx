import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { StatusCell } from '@ansible/common-ui/Status';
import { Tooltip } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSyncJobId } from '../../../common/getSyncJobId';
import { AwxRoute } from '../../../main/AwxRoutes';

type ProjectLike = {
  status?: string;
  summary_fields?: {
    last_job?: { id?: number };
    current_job?: { id?: number };
    current_update?: { id?: number };
  };
  related?: { last_job?: string };
};

export function buildProjectStatusCellProps(
  item: ProjectLike,
  getPageUrl: (route: string, config: { params: Record<string, string | number> }) => string,
  tooltipText?: string,
  tooltipAltText?: string,
  disableLinks?: boolean
) {
  const jobId = getSyncJobId(item.summary_fields, item.related?.last_job);
  const jobOutputUrl =
    jobId !== undefined && !disableLinks
      ? getPageUrl(AwxRoute.JobOutput, {
          params: {
            job_type: 'project',
            id: jobId,
          },
        })
      : undefined;

  return {
    tooltipContent: jobId !== undefined ? (tooltipText ?? '') : (tooltipAltText ?? ''),
    statusCellProps: {
      status: item.status,
      to: jobOutputUrl,
      disableLinks,
    },
  };
}

export function useProjectStatusColumn(options?: {
  tooltip?: string;
  tooltipAlt?: string;
  disableLinks?: boolean;
  disableSort?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const column: ITableColumn<ProjectLike> = useMemo(
    () => ({
      header: t('Status'),
      cell: (item) => {
        const { tooltipContent, statusCellProps } = buildProjectStatusCellProps(
          item,
          getPageUrl,
          options?.tooltip,
          options?.tooltipAlt,
          options?.disableLinks
        );

        return (
          <Tooltip content={tooltipContent} position="top">
            <StatusCell {...statusCellProps} />
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
