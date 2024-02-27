import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ITableColumn, useGetPageUrl } from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { Job } from '../../../interfaces/Job';

export function useInventoryJobsNameColumn() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const column = useMemo<ITableColumn<Job>>(
    () => ({
      header: t('Name'),
      cell: (job) => (
        <div
          style={{
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          <Link
            to={getPageUrl(AwxRoute.JobOutput, { params: { job_type: 'playbook', id: job.id } })}
          >
            {job.id} - {job.name}
          </Link>
        </div>
      ),
      sort: 'name',
      card: 'name',
      list: 'name',
      defaultSort: true,
    }),
    [t, getPageUrl]
  );
  return column;
}
