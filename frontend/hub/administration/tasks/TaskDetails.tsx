import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  DateTimeCell,
  PageDetails,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import { PageDetail } from '../../../../framework/PageDetails/PageDetail';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { StatusCell } from '../../../common/Status';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { pulpAPI } from '../../common/api/formatPath';
import { HubRoute } from '../../main/HubRoutes';
import { Task } from './Task';

export function TaskDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    data: task,
    error,
    refresh,
  } = useGet<Task>(params.id ? pulpAPI`/tasks/${params.id}` : '');

  const getPageUrl = useGetPageUrl();

  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (!task) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={task?.name}
        breadcrumbs={[
          { label: t('Task Management'), to: getPageUrl(HubRoute.Tasks) },
          { label: task?.name },
        ]}
      />
      <PageDetails>
        <PageDetail label={t('Name')}>{task?.name}</PageDetail>
        <PageDetail label={t('Status')}>
          <StatusCell status={task?.state} />
        </PageDetail>
        <PageDetail label={t('Started')}>
          <DateTimeCell format="since" value={task?.finished_at} />
        </PageDetail>
        <PageDetail label={t('Finished')}>
          <DateTimeCell format="since" value={task?.finished_at} />
        </PageDetail>
        <PageDetail label={t('Created')}>
          <DateTimeCell format="since" value={task?.pulp_created} />
        </PageDetail>
      </PageDetails>
    </PageLayout>
  );
}
