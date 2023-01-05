import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageDetails, PageHeader, PageLayout, SinceCell } from '../../../../framework';
import { PageDetail } from '../../../../framework/PageDetails/PageDetail';
import { StatusCell } from '../../../common/StatusCell';
import { useItem } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { Task } from './Task';

export function TaskDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const task = useItem<Task>('/api/automation-hub/pulp/api/v3/tasks', params.id ?? '0');
  return (
    <PageLayout>
      <PageHeader
        title={task?.name}
        breadcrumbs={[{ label: t('Task management'), to: RouteE.Tasks }, { label: task?.name }]}
      />
      <PageDetails>
        <PageDetail label={t('Name')}>{task?.name}</PageDetail>
        <PageDetail label={t('Status')}>
          <StatusCell status={task?.state} />
        </PageDetail>
        <PageDetail label={t('Started')}>
          <SinceCell value={task?.finished_at} />
        </PageDetail>
        <PageDetail label={t('Finished')}>
          <SinceCell value={task?.finished_at} />
        </PageDetail>
        <PageDetail label={t('Created')}>
          <SinceCell value={task?.pulp_created} />
        </PageDetail>
      </PageDetails>
    </PageLayout>
  );
}
