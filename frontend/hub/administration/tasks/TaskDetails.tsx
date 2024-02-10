import { CodeBlock, DescriptionList, Divider, capitalize } from '@patternfly/react-core';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
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
import { EmptyStateNoData } from '../../../../framework/components/EmptyStateNoData';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { StatusCell } from '../../../common/Status';
import { requestGet } from '../../../common/crud/Data';
import { HubError } from '../../common/HubError';
import { pulpAPI } from '../../common/api/formatPath';
import { parsePulpIDFromURL } from '../../common/api/hub-api-utils';
import { useGetFn } from '../../common/api/useGetFn';
import { HubRoute } from '../../main/HubRoutes';
import { Task } from './Task';

type TaskResource = { name?: string; type?: string; pluginName?: string; url?: string };

function maybeTranslate(name: string | undefined, t: TFunction) {
  const TASK_NAMES: Record<string, string> = {
    'galaxy_ng.app.tasks.curate_all_synclist_repository': t`Curate all synclist repositories`,
    'galaxy_ng.app.tasks.curate_synclist_repository': t`Curate synclist repository`,
    'galaxy_ng.app.tasks.import_and_auto_approve': t`Import and auto approve`,
    'galaxy_ng.app.tasks.import_and_move_to_staging': t`Import and move to staging`,
    'galaxy_ng.app.tasks.promotion._remove_content_from_repository': t`Remove content from repository`,
    'galaxy_ng.app.tasks.publishing.import_and_auto_approve': t`Import and auto approve`,
    'galaxy_ng.app.tasks.synclist.curate_synclist_repository_batch': t`Curate synclist repository batch`,
    'pulp_ansible.app.tasks.collections.collection_sync': t`pulp_ansible: Collection sync`,
    'pulp_ansible.app.tasks.collections.import_collection': t`pulp_ansible: Import collection`,
    'pulp_ansible.app.tasks.collections.sync': t`pulp_ansible: Collection sync`,
    'pulp_ansible.app.tasks.collections.update_collection_remote': t`pulp_ansible: Update collection remote`,
    'pulp_ansible.app.tasks.copy.copy_content': t`pulp_ansible: Copy content`,
    'pulp_ansible.app.tasks.roles.synchronize': t`pulp_ansible: Roles synchronize`,
    'pulp_container.app.tasks.build_image_from_containerfile': t`pulp_container: Build image from containerfile`,
    'pulp_container.app.tasks.general_multi_delete': t`pulp_container: General multi delete`,
    'pulp_container.app.tasks.recursive_add_content': t`pulp_container: Recursive add content`,
    'pulp_container.app.tasks.recursive_remove_content': t`pulp_container: Recursive remove content`,
    'pulp_container.app.tasks.synchronize': t`pulp_container: Tasks synchronize`,
    'pulp_container.app.tasks.tag_image': t`pulp_container: Tag image`,
    'pulp_container.app.tasks.untag_image': t`pulp_container: Untag image`,
    'pulpcore.app.tasks.export.pulp_export': t`pulpcore: Pulp export`,
    'pulpcore.app.tasks.pulp_import': t`pulpcore: Pulp import`,
    'pulpcore.app.tasks.repository.add_and_remove': t`pulpcore: Add and remove`,
    'pulpcore.app.tasks.repository.delete_version': t`pulpcore: Delete version`,
    'pulpcore.app.tasks.repository.repair_version': t`pulpcore: Repair version`,
    'pulpcore.app.tasks.upload.commit': t`pulpcore: Upload commit`,
    'pulpcore.plugin.tasking.add_and_remove': t`pulpcore: Add or remove`,
    'pulpcore.tasking.tasks.base.general_create': t`pulpcore: General create`,
    'pulpcore.tasking.tasks.base.general_delete': t`pulpcore: General delete`,
    'pulpcore.tasking.tasks.base.general_update': t`pulpcore: General update`,
    'pulpcore.tasking.tasks.import_repository_version': t`pulpcore: Import repository version`,
    'pulpcore.tasking.tasks.orphan_cleanup': t`pulpcore: Orphan cleanup`,
    'pulpcore.tasking.tasks.repair_all_artifacts': t`pulpcore: Repair all artifacts`,
  };

  return TASK_NAMES[name as string] || name;
}

function loadContent(taskId?: string) {
  if (!taskId) {
    return Promise.reject();
  }

  return requestGet<Task>(pulpAPI`/tasks/${taskId}/`).then((task) => {
    const allRelatedTasks = [];
    let parentTask: Task | null = null;
    const childTasks: Task[] = [];
    const resources: TaskResource[] = [];

    if (task.parent_task) {
      const parentTaskId = parsePulpIDFromURL(task.parent_task);
      allRelatedTasks.push(
        parentTaskId &&
          requestGet<Task>(pulpAPI`/tasks/${parentTaskId}/`)
            .then((data) => {
              parentTask = data;
            })
            .catch(() => null)
      );
    }

    if (task.child_tasks.length) {
      task.child_tasks.forEach((child) => {
        const childTaskId = parsePulpIDFromURL(child);
        allRelatedTasks.push(
          childTaskId &&
            requestGet<Task>(pulpAPI`/tasks/${childTaskId}/`)
              .then((data) => {
                childTasks.push(data);
              })
              .catch(() => null)
        );
      });
    }

    if (task.reserved_resources_record.length) {
      task.reserved_resources_record.forEach((url) => {
        const id = parsePulpIDFromURL(url);
        const urlParts = url.replace(process.env.HUB_API_PREFIX + '/pulp/api/v3/', '').split('/');
        let resourceType = '';
        let pluginName = '';

        // pulp hrefs follow this pattern for resources added by plugins: /<resource name>/<plugin name>/<resource type>/<pk>/
        // Locks can be added on the entire resource (ex /repositories/) or on a specific instance of a resource (ex /repositories/ansible/ansible/123123/)
        if (urlParts.length >= 3) {
          // if the url has 3 or more segements, parse out the resource, plugin name, and resource type
          resourceType = `${urlParts[0]}: ${urlParts[2]}`;
          pluginName = urlParts[1];
        } else {
          // otherwise, just return the resource type
          resourceType = urlParts[0];
        }

        if (id) {
          allRelatedTasks.push(
            requestGet<{ name: string }>(url)
              .then((data) => {
                resources.push({
                  name: data.name,
                  type: resourceType,
                  pluginName,
                  url,
                });
              })
              .catch(() => null)
          );
        } else {
          resources.push({ type: resourceType, url });
        }
      });
    }

    return Promise.all(allRelatedTasks).then(() => {
      return {
        task,
        childTasks,
        parentTask,
        resources,
      };
    });
  });
}

export function TaskDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data, error, isLoading, refresh } = useGetFn<{
    childTasks: Task[];
    parentTask: Task | null;
    resources: TaskResource[];
    task: Task;
  }>(`task-details-${params.id}`, () => loadContent(params.id));
  const { task, childTasks, parentTask, resources } = data || {};

  const getPageUrl = useGetPageUrl();
  const taskName = maybeTranslate(task?.name, t);

  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (isLoading) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={taskName}
        breadcrumbs={[
          { label: t('Task Management'), to: getPageUrl(HubRoute.Tasks) },
          { label: taskName },
        ]}
      />
      <PageDashboard>
        <PageDashboardCard title={t('Task detail')}>
          <PageDetails numberOfColumns="single">
            <PageDetail label={t('Name')}>{task?.name}</PageDetail>
            {task?.name !== taskName && (
              <PageDetail label={t('Descriptive name')}>{taskName}</PageDetail>
            )}
            <PageDetail label={t('Status')}>
              <StatusCell status={task?.state} />
            </PageDetail>
            <PageDetail label={t('Started')}>
              <DateTimeCell value={task?.finished_at} />
            </PageDetail>
            <PageDetail label={t('Finished')}>
              <DateTimeCell value={task?.finished_at} />
            </PageDetail>
            <PageDetail label={t('Created')}>
              <DateTimeCell value={task?.pulp_created} />
            </PageDetail>
          </PageDetails>
        </PageDashboardCard>
        <PageDashboardCard title={t('Task groups')}>
          <PageDetails numberOfColumns="single">
            <PageDetail label={t('Task group')}>
              {task?.task_group ? task.task_group : t`No task group`}
            </PageDetail>
            <PageDetail label={t('Parent task')}>
              {parentTask ? (
                <Link
                  to={`${getPageUrl(HubRoute.Tasks)}/${parsePulpIDFromURL(parentTask.pulp_href)}`}
                >
                  {maybeTranslate(parentTask.name, t)}
                </Link>
              ) : (
                t`No parent task`
              )}
            </PageDetail>
            <PageDetail label={t('Child task')}>
              {childTasks?.length
                ? childTasks?.map((childTask) => {
                    const childTaskId = parsePulpIDFromURL(childTask.pulp_href);
                    return (
                      <Link key={childTaskId} to={`${getPageUrl(HubRoute.Tasks)}/${childTaskId}`}>
                        {maybeTranslate(childTask.name, t)}
                      </Link>
                    );
                  })
                : t`No child task`}
            </PageDetail>
          </PageDetails>
        </PageDashboardCard>
        <PageDashboardCard title={t('Reserve resources')}>
          {resources?.length ? (
            <DescriptionList>
              {resources.map((resource, index) => (
                <>
                  <PageDetails numberOfColumns="single">
                    <PageDetail label={t('Type')}>{resource.type}</PageDetail>
                    {resource.pluginName && (
                      <PageDetail label={t('Plugin')}>{resource.pluginName}</PageDetail>
                    )}
                    {resource.name && <PageDetail label={t('Name')}>{resource.name}</PageDetail>}
                  </PageDetails>
                  {!(index === resources.length - 1) && <Divider inset={{ default: 'insetMd' }} />}
                </>
              ))}
            </DescriptionList>
          ) : (
            <EmptyStateNoData
              title={t`There is no resource record.`}
              description={t`There is no resource record.`}
            ></EmptyStateNoData>
          )}
        </PageDashboardCard>
        {!task?.error && (
          <PageDashboardCard title={t('Progress messages')}>
            {task?.progress_reports.length ? (
              <DescriptionList>
                {task.progress_reports.reverse().map((report, index) => (
                  <>
                    <PageDetails numberOfColumns="single">
                      {Object.keys(report).map((key) => {
                        return (
                          !!report[key] && (
                            <PageDetail
                              key={key}
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
                    {!(index === task.progress_reports.length - 1) && (
                      <Divider inset={{ default: 'insetMd' }} />
                    )}
                  </>
                ))}
              </DescriptionList>
            ) : (
              <EmptyStateNoData
                title={t`There is no progress message.`}
                description={t`There is no progress message.`}
              ></EmptyStateNoData>
            )}
          </PageDashboardCard>
        )}
        {!!task?.error && (
          <PageDashboardCard title={t('Error message')}>
            <PageDetails numberOfColumns="single">
              <PageDetail label={t('Description')}>
                <CodeBlock>{task.error.description}</CodeBlock>
              </PageDetail>
              <PageDetail label={t('Traceback')}>
                <CodeBlock>{task.error.traceback}</CodeBlock>
              </PageDetail>
            </PageDetails>
          </PageDashboardCard>
        )}
      </PageDashboard>
    </PageLayout>
  );
}
