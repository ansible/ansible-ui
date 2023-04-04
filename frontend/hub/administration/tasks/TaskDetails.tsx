import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageDetails, PageHeader, PageLayout, DateTimeCell } from '../../../../framework';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { PageDetail } from '../../../../framework/PageDetails/PageDetail';
import { AwxError } from '../../../awx/common/AwxError';
import { useGet } from '../../../common/crud/useGet';
import { StatusCell } from '../../../common/StatusCell';
import { RouteObj } from '../../../Routes';
import { Task } from './Task';

export function TaskDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    data: task,
    error,
    refresh,
  } = useGet<Task>(params.id ? `/api/automation-hub/pulp/api/v3/tasks/${params.id}` : '');

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!task) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={task?.name}
        breadcrumbs={[{ label: t('Task management'), to: RouteObj.Tasks }, { label: task?.name }]}
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
