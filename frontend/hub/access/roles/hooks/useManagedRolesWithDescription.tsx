import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useManagedRolesWithDescription() {
  const { t } = useTranslation();

  return useMemo<{ [key: string]: string }>(
    () => ({
      // galaxy roles
      'galaxy.ansible_repository_owner': t('Manage ansible repositories.'),
      'galaxy.collection_admin': t(
        'Create, delete and change collection namespaces. Upload and delete collections. Sync collections from remotes. Approve and reject collections.'
      ),
      'galaxy.collection_curator': t('Approve, reject and sync collections from remotes.'),
      'galaxy.collection_namespace_owner': t('Change and upload collections to namespaces.'),
      'galaxy.collection_publisher': t('Upload and modify collections.'),
      'galaxy.collection_remote_owner': t('Manage collection remotes.'),
      'galaxy.content_admin': t('Manage all content types.'),
      'galaxy.execution_environment_admin': t(
        'Push, delete, and change execution environments. Create, delete and change remote registries.'
      ),
      'galaxy.execution_environment_collaborator': t('Change existing execution environments.'),
      'galaxy.execution_environment_namespace_owner': t(
        'Create and update execution environments under existing container namespaces.'
      ),
      'galaxy.execution_environment_publisher': t('Push, and change execution environments.'),
      'galaxy.group_admin': t('View, add, remove and change groups.'),
      'galaxy.synclist_owner': t('View, add, remove and change synclists.'),
      'galaxy.task_admin': t('View, and cancel any task.'),
      'galaxy.user_admin': t('View, add, remove and change users.'),

      // core roles
      'core.task_owner': t('Allow all actions on a task.'),
      'core.taskschedule_owner': t('Allow all actions on a taskschedule.'),
    }),
    [t]
  );
}
