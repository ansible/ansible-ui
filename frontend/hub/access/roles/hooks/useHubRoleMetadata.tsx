import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type HubRoleMetadaContentType = {
  displayName: string;
  permissions: {
    [key: string]: string;
  };
};

export enum HubContentTypes {
  Namespace = 'galaxy.namespace',
  Collection = 'galaxy.collection',
  ExecutionEnvironment = 'galaxy.containernamespace',
  ContainerRegistryRemote = 'galaxy.containerregistryremote',
  SyncList = 'galaxy.synclist',
  Task = 'galaxy.task',
  CollectionRemote = 'galaxy.collectionremote',
  Repository = 'galaxy.ansiblerepository',
  System = 'null',
  Team = 'shared.team',
}

export interface HubRoleMetadata {
  content_types: Record<HubContentTypes, HubRoleMetadaContentType>;
}

export function useHubRoleMetadata(): HubRoleMetadata {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      content_types: {
        'galaxy.namespace': {
          displayName: t('Namespace'),
          permissions: {
            'galaxy.upload_to_namespace': t('Upload to namespace'),
            'galaxy.change_namespace': t('Change namespace'),
            'galaxy.delete_namespace': t('Delete namespace'),
            'galaxy.view_namespace': t('View namespace'),
            'galaxy.add_collectionimport': t('Add collection import'),
            'galaxy.change_collectionimport': t('Change collection import'),
            'galaxy.delete_collectionimport': t('Delete collection import'),
            'galaxy.view_collectionimport': t('View collection import'),
          },
        },
        'galaxy.collection': {
          displayName: t('Collection'),
          permissions: {
            'galaxy.change_collection': t('Change collection'),
            'galaxy.delete_collection': t('Delete collection'),
            'galaxy.view_collection': t('View collection'),
          },
        },
        'galaxy.collectionremote': {
          displayName: t('Collection Remote'),
          permissions: {
            'galaxy.manage_roles_collectionremote': t('Manage remote roles'),
            'galaxy.change_collectionremote': t('Change collection remote'),
            'galaxy.delete_collectionremote': t('Delete collection remote'),
            'galaxy.view_collectionremote': t('View collection remote'),
          },
        },
        'galaxy.ansiblerepository': {
          displayName: t('Ansible Repository'),
          permissions: {
            'galaxy.rebuild_metadata_ansiblerepository': t('Rebuild Ansible repository metadata'),
            'galaxy.repair_ansiblerepository': t('Repair Ansible repository'),
            'galaxy.sign_ansiblerepository': t('Sign Ansible repository'),
            'galaxy.sync_ansiblerepository': t('Sync Ansible repository'),
            'galaxy.manage_roles_ansiblerepository': t('Manage Ansible repository roles'),
            'galaxy.modify_ansible_repo_content': t('Modify Ansible repository content'),
            'galaxy.change_ansiblerepository': t('Change Ansible repository'),
            'galaxy.delete_ansiblerepository': t('Delete Ansible repository'),
            'galaxy.view_ansiblerepository': t('View Ansible repository'),
          },
        },
        'galaxy.containernamespace': {
          displayName: t('Execution Environment'),
          permissions: {
            'galaxy.change_containernamespace': t('Change container namespace'),
            'galaxy.delete_containernamespace': t('Delete container namespace'),
            'galaxy.view_containernamespace': t('View container namespace'),
          },
        },
        'galaxy.containerregistryremote': {
          displayName: t('Container Registry Remote'),
          permissions: {
            'galaxy.change_containerregistryremote': t('Change container registry remote'),
            'galaxy.delete_containerregistryremote': t('Delete container registry remote'),
            'galaxy.view_containerregistryremote': t('View container registry remote'),
          },
        },
        'galaxy.task': {
          displayName: t('Task'),
          permissions: {
            'galaxy.change_task': t('Change task'),
            'galaxy.view_task': t('Delete task'),
            'galaxy.delete_task': t('View task'),
          },
        },
        'galaxy.synclist': {
          displayName: t('Sync List'),
          permissions: {
            'galaxy.change_synclist': t('Change sync list'),
            'galaxy.delete_synclist': t('Delete sync list'),
            'galaxy.view_synclist': t('View sync list'),
          },
        },
        null: {
          displayName: t('System'),
          permissions: {
            'galaxy.rebuild_metadata_ansiblerepository': t('Rebuild metadata Ansible repository'),
            'galaxy.repair_ansiblerepository': t('Repair metadata Ansible repository'),
            'galaxy.sign_ansiblerepository': t('Sign metadata Ansible repository'),
            'galaxy.sync_ansiblerepository': t('Sync metadata Ansible repository'),
            'galaxy.manage_roles_ansiblerepository': t('Repair metadata Ansible repository'),
            'galaxy.modify_ansible_repo_content': t('Manage repository roles'),
            'galaxy.add_ansiblerepository': t('Add Ansible repository'),
            'galaxy.change_ansiblerepository': t('Change Ansible repository'),
            'galaxy.delete_ansiblerepository': t('Delete Ansible repository'),
            'galaxy.view_ansiblerepository': t('View Ansible repository'),
            'galaxy.add_collection': t('Add collection'),
            'galaxy.change_collection': t('Change collection'),
            'galaxy.delete_collection': t('Delete collection'),
            'galaxy.view_collection': t('View collection'),
            'galaxy.add_collectionimport': t('Add collection import'),
            'galaxy.change_collectionimport': t('Change collection import'),
            'galaxy.delete_collectionimport': t('Delete collection import'),
            'galaxy.view_collectionimport': t('View collection import'),
            'galaxy.manage_roles_collectionremote': t('Manage remote roles'),
            'galaxy.add_collectionremote': t('Add collection remote'),
            'galaxy.change_collectionremote': t('Change collection remote'),
            'galaxy.delete_collectionremote': t('Delete collection remote'),
            'galaxy.view_collectionremote': t('View collection remote'),
            'galaxy.namespace_add_containerdistribution':
              'galaxy.namespace_add_containerdistribution',
            'galaxy.namespace_delete_containerdistribution':
              'galaxy.namespace_delete_containerdistribution',
            'galaxy.namespace_view_containerdistribution':
              'galaxy.namespace_view_containerdistribution',
            'galaxy.namespace_pull_containerdistribution':
              'galaxy.namespace_pull_containerdistribution',
            'galaxy.namespace_push_containerdistribution':
              'galaxy.namespace_push_containerdistribution',
            'galaxy.namespace_change_containerdistribution':
              'galaxy.namespace_change_containerdistribution',
            'galaxy.namespace_view_containerpushrepository':
              'galaxy.namespace_view_containerpushrepository',
            'galaxy.namespace_modify_content_containerpushrepository':
              'galaxy.namespace_modify_content_containerpushrepository',
            'galaxy.namespace_change_containerpushrepository':
              'galaxy.namespace_change_containerpushrepository',
            'galaxy.manage_roles_containernamespace': t('Manage container namespace roles'),
            'galaxy.add_containernamespace': t('Add container namespace'),
            'galaxy.change_containernamespace': t('Change container namespace'),
            'galaxy.delete_containernamespace': t('Delete container namespace'),
            'galaxy.view_containernamespace': t('View container namespace'),
            'galaxy.add_containerregistryremote': t('View container registry remote'),
            'galaxy.change_containerregistryremote': t('View container registry remote'),
            'galaxy.delete_containerregistryremote': t('View container registry remote'),
            'galaxy.view_containerregistryremote': t('View container registry remote'),
            'galaxy.sync_containerrepository': t('Sync container registry remote'),
            'galaxy.modify_content_containerrepository':
              'galaxy.modify_content_containerrepository',
            'galaxy.build_image_containerrepository': 'galaxy.build_image_containerrepository',
            'galaxy.delete_containerrepository_versions': t('Delete container repository versions'),
            'galaxy.manage_roles_containerrepository': t('Manage container repository roles'),
            'galaxy.add_containerrepository': t('Add container repository'),
            'galaxy.change_containerrepository': t('Change container repository'),
            'galaxy.delete_containerrepository': t('Delete container repository'),
            'galaxy.view_containerrepository': t('View container repository'),
            'galaxy.upload_to_namespace': t('Upload to namespace'),
            'galaxy.add_namespace': t('Add namespace'),
            'galaxy.change_namespace': t('Change namespace'),
            'galaxy.delete_namespace': t('Delete namespace'),
            'galaxy.view_namespace': t('View namespace'),
            'galaxy.manage_roles_task': t('Manage task roles'),
            'galaxy.add_task': t('Add task'),
            'galaxy.change_task': t('Change task'),
            'galaxy.delete_task': t('Delete task'),
            'galaxy.view_task': t('View task'),
            'shared.view_team': t('View team'),
          },
        },
        'shared.team': {
          displayName: t('Sync List'),
          permissions: {
            'galaxy.change_team': t('Change team'),
            'galaxy.delete_team': t('Delete team'),
            'galaxy.view_team': t('View team'),
          },
        },
      },
    }),
    [t]
  );
}
