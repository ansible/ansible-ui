import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  DateTimeCell,
  PageDashboard,
  PageDashboardCard,
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
import { DescriptionList, Divider, capitalize } from '@patternfly/react-core';
import { EmptyStateNoData } from '../../../framework/components/EmptyStateNoData';

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
      <PageDashboard>
        <PageDashboardCard title={t('Task detail')}>
          <DescriptionList>
            <PageDetails numberOfColumns="single">
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
          </DescriptionList>
        </PageDashboardCard>
        <PageDashboardCard title={t('Task groups')}>
          <DescriptionList>
            <PageDetails numberOfColumns="single">
              <PageDetail label={t('Task group')}>
                {task.task_group ? task.task_group : t`No task group`}
              </PageDetail>
              <PageDetail label={t('Parent task')}>
                {task.parent_task ? task.parent_task : t`No parent task`}
              </PageDetail>
              <PageDetail label={t('Child task')}>
                {task.child_tasks.length > 0 ? task.child_tasks : t`No child task`}
              </PageDetail>
            </PageDetails>
          </DescriptionList>
        </PageDashboardCard>
        <PageDashboardCard title={t('Reserve resources')}>
          {/* {resources.length ? (
            <DescriptionList>
              {resources.map((resource) => {
                return (
                  <>
                    <PageDetails key={''} numberOfColumns="single">
                      <PageDetail label={t('Type')}>{resource.type}</PageDetail>
                      {resource.pluginName && (
                        <PageDetail label={t('Plugin')}>{resource.pluginName}</PageDetail>
                      )}
                      {resource.name && <PageDetail label={t('Name')}>{resource.name}</PageDetail>}
                    </PageDetails>
                    <Divider inset={{ default: 'insetMd' }} />
                  </>
                );
              })}
            </DescriptionList>
          ) : (
            <EmptyStateNoData
              title={t`There is no resource record.`}
              description={t`There is no resource record.`}
            ></EmptyStateNoData>
          )} */}
        </PageDashboardCard>
        <PageDashboardCard title={t('Progress messages')}>
          {task.progress_reports.length ? (
            <DescriptionList>
              {task.progress_reports.reverse().map((report) => {
                return (
                  <>
                    <PageDetails key={''} numberOfColumns="single">
                      {Object.keys(report).map((key) => {
                        return (
                          !!report[key] && (
                            <PageDetail
                              label={
                                {
                                  message: t`Message`,
                                  code: t`Code`,
                                  state: t`State`,
                                  done: t`Done`,
                                }[key] || capitalize(key)
                              }
                            >
                              {report[key]}
                            </PageDetail>
                          )
                        );
                      })}
                    </PageDetails>
                    <Divider inset={{ default: 'insetMd' }} />
                  </>
                );
              })}
            </DescriptionList>
          ) : (
            <EmptyStateNoData
              title={t`There is no progress message.`}
              description={t`There is no progress message.`}
            ></EmptyStateNoData>
          )}
        </PageDashboardCard>
      </PageDashboard>
    </PageLayout>
  );
}
