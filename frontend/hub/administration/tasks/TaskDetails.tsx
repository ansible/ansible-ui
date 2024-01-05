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
import { parsePulpIDFromURL } from '../api/utils';
import { Fragment } from 'react';
import { get, useGetFn } from '../useGetFn';

function maybeTranslate(name, t) {
  const TASK_NAMES = {
    'galaxy_ng.app.tasks.curate_all_synclist_repository': t`Curate all synclist repositories`,
    'galaxy_ng.app.tasks.curate_synclist_repository': t`Curate synclist repository`,
    'galaxy_ng.app.tasks.import_and_auto_approve': t`Import and auto approve`,
    'galaxy_ng.app.tasks.import_and_move_to_staging': t`Import and move to staging`,
    'galaxy_ng.app.tasks.promotion._remove_content_from_repository': t`Remove content from repository`,
    'galaxy_ng.app.tasks.publishing.import_and_auto_approve': t`Import and auto approve`,
    'galaxy_ng.app.tasks.synclist.curate_synclist_repository_batch': t`Curate synclist repository batch`,
    'pulp_ansible.app.tasks.collections.collection_sync': t`Pulp ansible: collection sync`,
    'pulp_ansible.app.tasks.collections.import_collection': t`Pulp ansible: Import collection`,
    'pulp_ansible.app.tasks.collections.sync': t`Pulp Ansible: Collections sync`,
    'pulp_ansible.app.tasks.collections.update_collection_remote': t`Pulp ansible: Update collection remote`,
    'pulp_ansible.app.tasks.copy.copy_content': t`Pulp ansible: Copy content`,
    'pulp_ansible.app.tasks.roles.synchronize': t`Pulp Ansible: Roles synchronize`,
    'pulp_container.app.tasks.build_image_from_containerfile': t`Pulp container: Build image from containerfile`,
    'pulp_container.app.tasks.general_multi_delete': t`Pulp container: General multi delete`,
    'pulp_container.app.tasks.recursive_add_content': t`Pulp container: Recursive add content`,
    'pulp_container.app.tasks.recursive_remove_content': t`Pulp container: Recursive remove content`,
    'pulp_container.app.tasks.synchronize': t`Pulp container: Tasks synchronize`,
    'pulp_container.app.tasks.tag_image': t`Pulp container: Tag image`,
    'pulp_container.app.tasks.untag_image': t`Pulp container: Untage image`,
    'pulpcore.app.tasks.export.pulp_export': t`Pulpcore: Pulp export`,
    'pulpcore.app.tasks.pulp_import': t`Pulpcore: Pulp import`,
    'pulpcore.app.tasks.repository.add_and_remove': t`Pulpcore: Add and remove`,
    'pulpcore.app.tasks.repository.delete_version': t`Pulpcore: Delete version`,
    'pulpcore.app.tasks.repository.repair_version': t`Pulpcore: Repair version`,
    'pulpcore.app.tasks.upload.commit': t`Pulpcore: Upload commit`,
    'pulpcore.plugin.tasking.add_and_remove': t`Pulpcore: Add or remove`,
    'pulpcore.tasking.tasks.base.general_create': t`Pulpcore: General create`,
    'pulpcore.tasking.tasks.base.general_delete': t`Pulpcore: General delete`,
    'pulpcore.tasking.tasks.base.general_update': t`Pulpcore: General update`,
    'pulpcore.tasking.tasks.import_repository_version': t`Pulpcore: Import repository version`,
    'pulpcore.tasking.tasks.orphan_cleanup': t`Pulpcore: Orphan cleanup`,
    'pulpcore.tasking.tasks.repair_all_artifacts': t`Pulpcore: Repair all artifacts`,
  };

  return TASK_NAMES[name] || name;
}

function loadContent(taskId) {
  if (!taskId) {
    return null;
  }

  return get(pulpAPI`/tasks/${taskId}/`).then((task) => {
    const allRelatedTasks = [];
    let parentTask = null;
    const childTasks = [];
    const resources = [];

    if (task.parent_task) {
      const parentTaskId = parsePulpIDFromURL(task.parent_task);
      allRelatedTasks.push(
        get(pulpAPI`/tasks/${parentTaskId}/`)
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
          get(pulpAPI`/tasks/${childTaskId}/`)
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

        // pulp hrefs follow this pattern for resources added by plugins:
        // /<resource name>/<plugin name>/<resource type>/<pk>/
        // Locks can be added on the entire resource (ex /repositories/) or on a specific
        // instance of a resource (ex /repositories/ansible/ansible/123123/

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
            get(url)
              .then((data) => {
                resources.push({
                  name: data.name,
                  type: resourceType,
                  pluginName: pluginName,
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
    parentTask?: Task;
    resources: unknown[];
    task: Task;
  }>(loadContent, params.id);
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
          <DescriptionList>
            <PageDetails numberOfColumns="single">
              <PageDetail label={t('Name')}>{task?.name}</PageDetail>
              {task?.name !== taskName && (
                <PageDetail label={t('Descriptive name')}>{taskName}</PageDetail>
              )}
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
          {resources.length ? (
            <DescriptionList>
              {resources.map((resource) => (
                <Fragment key={resource.url}>
                  <PageDetails numberOfColumns="single">
                    <PageDetail label={t('Type')}>{resource.type}</PageDetail>
                    {resource.pluginName && (
                      <PageDetail label={t('Plugin')}>{resource.pluginName}</PageDetail>
                    )}
                    {resource.name && <PageDetail label={t('Name')}>{resource.name}</PageDetail>}
                  </PageDetails>
                  <Divider inset={{ default: 'insetMd' }} />
                </Fragment>
              ))}
            </DescriptionList>
          ) : (
            <EmptyStateNoData
              title={t`There is no resource record.`}
              description={t`There is no resource record.`}
            ></EmptyStateNoData>
          )}
        </PageDashboardCard>
        <PageDashboardCard title={t('Progress messages')}>
          {task.progress_reports.length ? (
            <DescriptionList>
              {task.progress_reports.reverse().map((report) => (
                <Fragment key={report}>
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
                  <Divider inset={{ default: 'insetMd' }} />
                </Fragment>
              ))}
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
