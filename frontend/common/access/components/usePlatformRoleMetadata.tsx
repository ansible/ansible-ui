import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type PlatformRoleMetadataContentType = {
  displayName: string;
  permissions: {
    [key: string]: string;
  };
};

export enum PlatformContentTypeEnum {
  Credential = 'awx.credential',
  ExecutionEnvironment = 'awx.executionenvironment',
  InstanceGroup = 'awx.instancegroup',
  Inventory = 'awx.inventory',
  JobTemplate = 'awx.jobtemplate',
  NotificationTemplate = 'awx.notificationtemplate',
  Organization = 'shared.organization',
  Project = 'awx.project',
  Team = 'shared.team',
  WorkflowJobTemplate = 'awx.workflowjobtemplate',
  Activation = 'eda.activation',
  AuditRule = 'eda.auditrule',
  EdaCredential = 'eda.edacredential',
  DecisionEnvironment = 'eda.decisionenvironment',
  EventStream = 'eda.eventstream',
  EdaProject = 'eda.project',
  Rulebook = 'eda.rulebook',
  RulebookProcess = 'eda.rulebookprocess',
  Namespace = 'galaxy.namespace',
  Collection = 'galaxy.collection',
  HubExecutionEnvironment = 'galaxy.containernamespace',
  ContainerRegistryRemote = 'galaxy.containerregistryremote',
  SyncList = 'galaxy.synclist',
  Task = 'galaxy.task',
  CollectionRemote = 'galaxy.collectionremote',
  Repository = 'galaxy.ansiblerepository',
  System = 'null',
}

export function groupFromRoleType(type: string, t: (value: string) => string): string {
  const group = type.split('.')[0];
  switch (group) {
    case 'awx':
      return t('Automation Execution');
    case 'eda':
      return t('Automation Decisions');
    case 'galaxy':
      return t('Automation Content');
    default:
      return '';
  }
}
export interface PlatformRoleMetadata {
  content_types: Record<PlatformContentTypeEnum, PlatformRoleMetadataContentType>;
}

export function usePlatformRoleMetadata(): PlatformRoleMetadata {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      content_types: {
        'awx.credential': {
          displayName: t('Credential (Automation Execution)'),
          permissions: {
            'awx.use_credential': t('Can use credential in a job or related resource'),
            'awx.change_credential': t('Can change credential'),
            'awx.delete_credential': t('Can delete credential'),
            'awx.view_credential': t('Can view credential'),
          },
        },
        'awx.executionenvironment': {
          displayName: t('Execution environment'),
          permissions: {
            'awx.change_executionenvironment': t('Can change execution environment'),
            'awx.delete_executionenvironment': t('Can delete execution environment'),
          },
        },
        'awx.instancegroup': {
          displayName: t('Instance group'),
          permissions: {
            'awx.use_instancegroup': t('Can use instance group'),
            'awx.change_instancegroup': t('Can change instance group'),
            'awx.delete_instancegroup': t('Can delete instance group'),
            'awx.view_instancegroup': t('Can view instance group'),
          },
        },
        'awx.inventory': {
          displayName: t('Inventory'),
          permissions: {
            'awx.use_inventory': t('Can use inventory in a job template'),
            'awx.adhoc_inventory': t('Can run ad hoc commands'),
            'awx.update_inventory': t('Can update inventory'),
            'awx.change_inventory': t('Can change inventory'),
            'awx.delete_inventory': t('Can delete inventory'),
            'awx.view_inventory': t('Can view inventory'),
          },
        },
        'awx.jobtemplate': {
          displayName: t('Job template'),
          permissions: {
            'awx.execute_jobtemplate': t('Can run this job template'),
            'awx.change_jobtemplate': t('Can change job template'),
            'awx.delete_jobtemplate': t('Can delete job template'),
            'awx.view_jobtemplate': t('Can view job template'),
          },
        },
        'awx.notificationtemplate': {
          displayName: t('Notification template'),
          permissions: {
            'awx.change_notificationtemplate': t('Can change notification template'),
            'awx.delete_notificationtemplate': t('Can delete notification template'),
            'awx.view_notificationtemplate': t('Can view notification template'),
          },
        },
        'shared.organization': {
          displayName: t('Organization'),
          permissions: {
            'shared.member_organization': t('Member organization'),
            'shared.audit_organization': t('Audit organization'),
            'shared.change_organization': t('Can change organization'),
            'shared.delete_organization': t('Can delete organization'),
            'shared.view_organization': t('Can view organization'),
            'awx.update_project': t('Can update project'),
            'awx.use_project': t('Can use project'),
            'awx.add_project': t('Can add project'),
            'awx.change_project': t('Can change project'),
            'awx.delete_project': t('Can delete project'),
            'awx.view_project': t('Can view project'),
            'shared.member_team': t('Member team'),
            'shared.add_team': t('Can add team'),
            'shared.change_team': t('Can change team'),
            'shared.delete_team': t('Can delete team'),
            'shared.view_team': t('Can view team'),
            'awx.execute_workflowjobtemplate': t('Can execute workflow job template'),
            'awx.approve_workflowjobtemplate': t('Can approve workflow job template'),
            'awx.add_workflowjobtemplate': t('Can add workflow job template'),
            'awx.change_workflowjobtemplate': t('Can change workflow job template'),
            'awx.delete_workflowjobtemplate': t('Can delete workflow job template'),
            'awx.view_workflowjobtemplate': t('Can view workflow job template'),
            'awx.execute_jobtemplate': t('Can execute job template'),
            'awx.change_jobtemplate': t('Can change job template'),
            'awx.delete_jobtemplate': t('Can delete job template'),
            'awx.view_jobtemplate': t('Can view job template'),
            'awx.use_inventory': t('Can use inventory'),
            'awx.adhoc_inventory': t('Can run ad hoc commands'),
            'awx.update_inventory': t('Can update inventory'),
            'awx.add_inventory': t('Can add inventory'),
            'awx.change_inventory': t('Can change inventory'),
            'awx.delete_inventory': t('Can delete inventory'),
            'awx.view_inventory': t('Can view inventory'),
            'awx.use_credential': t('Can use credential'),
            'awx.add_credential': t('Can add credential'),
            'awx.change_credential': t('Can change credential'),
            'awx.delete_credential': t('Can delete credential'),
            'awx.view_credential': t('Can view credential'),
            'awx.add_notificationtemplate': t('Can add notification template'),
            'awx.change_notificationtemplate': t('Can change notification template'),
            'awx.delete_notificationtemplate': t('Can delete notification template'),
            'awx.view_notificationtemplate': t('Can view notification template'),
            'awx.add_executionenvironment': t('Can add execution environment'),
            'awx.change_executionenvironment': t('Can change execution environment'),
            'awx.delete_executionenvironment': t('Can delete execution environment'),
            'eda.enable_activation': t('Can enable activation'),
            'eda.disable_activation': t('Can disable activation'),
            'eda.restart_activation': t('Can restart activation'),
            'eda.add_activation': t('Can add activation'),
            'eda.view_activation': t('Can view activation'),
            'eda.delete_activation': t('Can delete activation'),
            'eda.view_rulebookprocess': t('Can view rulebook process'),
            'eda.view_auditrule': t('Can view audit rule'),
            'eda.add_edacredential': t('Can add eda credential'),
            'eda.change_edacredential': t('Can change eda credential'),
            'eda.delete_edacredential': t('Can delete eda credential'),
            'eda.view_edacredential': t('Can view eda credential'),
            'eda.add_decisionenvironment': t('Can add decision environment'),
            'eda.change_decisionenvironment': t('Can change decision environment'),
            'eda.delete_decisionenvironment': t('Can delete decision environment'),
            'eda.view_decisionenvironment': t('Can view decision environment'),
            'eda.sync_project': t('Can sync eda project'),
            'eda.add_project': t('Can add eda project'),
            'eda.change_project': t('Can change eda project'),
            'eda.delete_project': t('Can delete eda project'),
            'eda.view_project': t('Can view eda project'),
            'eda.view_rulebook': t('Can view rulebook'),
            'eda.add_eventstream': t('Can add event stream'),
            'eda.change_eventstream': t('Can change event stream'),
            'eda.delete_eventstream': t('Can delete event stream'),
            'eda.view_eventstream': t('Can view event stream'),
          },
        },
        'awx.project': {
          displayName: t('Project (Automation Execution)'),
          permissions: {
            'awx.update_project': t('Can update project'),
            'awx.use_project': t('Can use project'),
            'awx.change_project': t('Can change project'),
            'awx.delete_project': t('Can delete project'),
            'awx.view_project': t('Can view project'),
          },
        },
        'shared.team': {
          displayName: t('Team'),
          permissions: {
            'shared.member_team': t('Member team'),
            'shared.change_team': t('Can change team'),
            'shared.delete_team': t('Can delete team'),
            'shared.view_team': t('Can view team'),
          },
        },
        'awx.workflowjobtemplate': {
          displayName: t('Workflow job template'),
          permissions: {
            'awx.execute_workflowjobtemplate': t('Can run this workflow job template'),
            'awx.approve_workflowjobtemplate': t('Can approve steps in this workflow job template'),
            'awx.change_workflowjobtemplate': t('Can change workflow job template'),
            'awx.delete_workflowjobtemplate': t('Can delete workflow job template'),
            'awx.view_workflowjobtemplate': t('Can view workflow job template'),
          },
        },
        'eda.activation': {
          displayName: t('Rulebook Activation'),
          permissions: {
            'eda.enable_activation': t('Can enable an activation'),
            'eda.disable_activation': t('Can disable an activation'),
            'eda.restart_activation': t('Can restart an activation'),
            'eda.view_activation': t('Can view activation'),
            'eda.delete_activation': t('Can delete activation'),
            'eda.view_rulebookprocess': t('Can view rulebook process'),
            'eda.view_auditrule': t('Can view audit rule'),
          },
        },
        'eda.auditrule': {
          displayName: t('Audit Rule'),
          permissions: {
            'eda.view_auditrule': t('Can view audit rule'),
          },
        },
        'eda.edacredential': {
          displayName: t('Credential (Automation Decisions)'),
          permissions: {
            'eda.change_edacredential': t('Can change credential'),
            'eda.delete_edacredential': t('Can delete credential'),
            'eda.view_edacredential': t('Can view credential'),
          },
        },
        'eda.decisionenvironment': {
          displayName: t('Decision Environment'),
          permissions: {
            'eda.change_decisionenvironment': t('Can change decision environment'),
            'eda.delete_decisionenvironment': t('Can delete decision environment'),
            'eda.view_decisionenvironment': t('Can view decision environment'),
          },
        },
        'eda.eventstream': {
          displayName: t('Event stream'),
          permissions: {
            'eda.change_eventstream': t('Can change event stream'),
            'eda.delete_eventstream': t('Can delete event stream'),
            'eda.view_eventstream': t('Can view event stream'),
          },
        },
        'eda.project': {
          displayName: t('Project (Automation Decisions)'),
          permissions: {
            'eda.sync_project': t('Can sync a project'),
            'eda.change_project': t('Can change project'),
            'eda.delete_project': t('Can delete project'),
            'eda.view_project': t('Can view project'),
            'eda.view_rulebook': t('Can view rulebook'),
          },
        },
        'eda.rulebook': {
          displayName: t('Rulebook'),
          permissions: {
            'eda.view_rulebook': t('Can view rulebook'),
          },
        },
        'eda.rulebookprocess': {
          displayName: t('Rulebook Process'),
          permissions: {
            'eda.view_rulebookprocess': t('Can view rulebook process'),
            'eda.view_auditrule': t('Can view audit rule'),
          },
        },
        'galaxy.namespace': {
          displayName: t('Namespace'),
          permissions: {
            'galaxy.upload_to_namespace': t('Can upload to namespace'),
            'galaxy.change_namespace': t('Can change namespace'),
            'galaxy.delete_namespace': t('Can delete namespace'),
            'galaxy.view_namespace': t('Can view namespace'),
            'galaxy.add_collectionimport': t('Can add collection import'),
            'galaxy.change_collectionimport': t('Can change collection import'),
            'galaxy.delete_collectionimport': t('Can delete collection import'),
            'galaxy.view_collectionimport': t('Can view collection import'),
          },
        },
        'galaxy.collection': {
          displayName: t('Collection'),
          permissions: {
            'galaxy.change_collection': t('Can change collection'),
            'galaxy.delete_collection': t('Can delete collection'),
            'galaxy.view_collection': t('Can view collection'),
          },
        },
        'galaxy.collectionremote': {
          displayName: t('Remote'),
          permissions: {
            'galaxy.manage_roles_collectionremote': t('Can manage remote roles'),
            'galaxy.change_collectionremote': t('Can change collection remote'),
            'galaxy.delete_collectionremote': t('Can delete collection remote'),
            'galaxy.view_collectionremote': t('Can view collection remote'),
          },
        },
        'galaxy.ansiblerepository': {
          displayName: t('Repository'),
          permissions: {
            'galaxy.rebuild_metadata_ansiblerepository': t(
              'Can rebuild Ansible repository metadata'
            ),
            'galaxy.repair_ansiblerepository': t('Can repair Ansible repository'),
            'galaxy.sign_ansiblerepository': t('Can sign Ansible repository'),
            'galaxy.sync_ansiblerepository': t('Can sync Ansible repository'),
            'galaxy.manage_roles_ansiblerepository': t('Can manage Ansible repository roles'),
            'galaxy.modify_ansible_repo_content': t('Can modify Ansible repository content'),
            'galaxy.change_ansiblerepository': t('Can change Ansible repository'),
            'galaxy.delete_ansiblerepository': t('Can delete Ansible repository'),
            'galaxy.view_ansiblerepository': t('Can view Ansible repository'),
          },
        },
        'galaxy.containernamespace': {
          displayName: t('Execution Environment'),
          permissions: {
            'galaxy.change_containernamespace': t('Can change container namespace'),
            'galaxy.delete_containernamespace': t('Can delete container namespace'),
            'galaxy.view_containernamespace': t('Can view container namespace'),
            'galaxy.namespace_add_containerdistribution': t('Can push new containers'),
            'galaxy.namespace_delete_containerdistribution':
              'galaxy.namespace_delete_containerdistribution',
            'galaxy.namespace_view_containerdistribution':
              'galaxy.namespace_view_containerdistribution',
            'galaxy.namespace_pull_containerdistribution':
              'galaxy.namespace_pull_containerdistribution',
            'galaxy.namespace_push_containerdistribution': t('Can push to existing containers'),
            'galaxy.namespace_change_containerdistribution': t('Can change containers'),
            'galaxy.namespace_view_containerpushrepository':
              'galaxy.namespace_view_containerpushrepository',
            'galaxy.namespace_modify_content_containerpushrepository': t('Can change image tags'),
            'galaxy.namespace_change_containerpushrepository':
              'galaxy.namespace_change_containerpushrepository',
            'galaxy.manage_roles_containernamespace': t('Can manage container namespace roles'),
          },
        },
        'galaxy.containerregistryremote': {
          displayName: t('Container Registry Remote'),
          permissions: {
            'galaxy.change_containerregistryremote': t('Can change container registry remote'),
            'galaxy.delete_containerregistryremote': t('Can delete container registry remote'),
            'galaxy.view_containerregistryremote': t('Can view container registry remote'),
          },
        },
        'galaxy.task': {
          displayName: t('Task'),
          permissions: {
            'galaxy.change_task': t('Can change task'),
            'galaxy.view_task': t('Can view task'),
            'galaxy.delete_task': t('Can delete task'),
          },
        },
        'galaxy.synclist': {
          displayName: t('Sync List'),
          permissions: {
            'galaxy.change_synclist': t('Can change sync list'),
            'galaxy.delete_synclist': t('Can delete sync list'),
            'galaxy.view_synclist': t('Can view sync list'),
          },
        },
        null: {
          displayName: t('System'),
          permissions: {
            'galaxy.rebuild_metadata_ansiblerepository': t(
              'Can rebuild metadata Ansible repository'
            ),
            'galaxy.repair_ansiblerepository': t('Can repair metadata Ansible repository'),
            'galaxy.sign_ansiblerepository': t('Can sign metadata Ansible repository'),
            'galaxy.sync_ansiblerepository': t('Can sync metadata Ansible repository'),
            'galaxy.manage_roles_ansiblerepository': t('Can repair metadata Ansible repository'),
            'galaxy.modify_ansible_repo_content': t('Can manage repository roles'),
            'galaxy.add_ansiblerepository': t('Can add Ansible repository'),
            'galaxy.change_ansiblerepository': t('Can change Ansible repository'),
            'galaxy.delete_ansiblerepository': t('Can delete Ansible repository'),
            'galaxy.view_ansiblerepository': t('Can view Ansible repository'),
            'galaxy.add_collection': t('Can add collection'),
            'galaxy.change_collection': t('Can change collection'),
            'galaxy.delete_collection': t('Can delete collection'),
            'galaxy.view_collection': t('Can view collection'),
            'galaxy.add_collectionimport': t('Can add collection import'),
            'galaxy.change_collectionimport': t('Can change collection import'),
            'galaxy.delete_collectionimport': t('Can delete collection import'),
            'galaxy.view_collectionimport': t('Can view collection import'),
            'galaxy.manage_roles_collectionremote': t('Can Manage remote roles'),
            'galaxy.add_collectionremote': t('Can add collection remote'),
            'galaxy.change_collectionremote': t('Can change collection remote'),
            'galaxy.delete_collectionremote': t('Can delete collection remote'),
            'galaxy.view_collectionremote': t('Can view collection remote'),
            'galaxy.namespace_add_containerdistribution': t('Can push new containers'),
            'galaxy.namespace_delete_containerdistribution':
              'galaxy.namespace_delete_containerdistribution',
            'galaxy.namespace_view_containerdistribution':
              'galaxy.namespace_view_containerdistribution',
            'galaxy.namespace_pull_containerdistribution':
              'galaxy.namespace_pull_containerdistribution',
            'galaxy.namespace_push_containerdistribution': t('Can push to existing containers'),
            'galaxy.namespace_change_containerdistribution': t('Can change containers'),
            'galaxy.namespace_view_containerpushrepository':
              'galaxy.namespace_view_containerpushrepository',
            'galaxy.namespace_modify_content_containerpushrepository': t('Can change image tags'),
            'galaxy.namespace_change_containerpushrepository':
              'galaxy.namespace_change_containerpushrepository',
            'galaxy.manage_roles_containernamespace': t('Can manage container namespace roles'),
            'galaxy.add_containernamespace': t('Can add container namespace'),
            'galaxy.change_containernamespace': t('Can change container namespace'),
            'galaxy.delete_containernamespace': t('Can delete container namespace'),
            'galaxy.view_containernamespace': t('Can view container namespace'),
            'galaxy.add_containerregistryremote': t('Can view container registry remote'),
            'galaxy.change_containerregistryremote': t('Can view container registry remote'),
            'galaxy.delete_containerregistryremote': t('Can view container registry remote'),
            'galaxy.view_containerregistryremote': t('Can view container registry remote'),
            'galaxy.sync_containerrepository': t('Can sync container registry remote'),
            'galaxy.modify_content_containerrepository':
              'galaxy.modify_content_containerrepository',
            'galaxy.build_image_containerrepository': 'galaxy.build_image_containerrepository',
            'galaxy.delete_containerrepository_versions': t(
              'Can delete container repository versions'
            ),
            'galaxy.manage_roles_containerrepository': t('Can manage container repository roles'),
            'galaxy.add_containerrepository': t('Can add container repository'),
            'galaxy.change_containerrepository': t('Can change container repository'),
            'galaxy.delete_containerrepository': t('Can delete container repository'),
            'galaxy.view_containerrepository': t('Can view container repository'),
            'galaxy.upload_to_namespace': t('Can upload to namespace'),
            'galaxy.add_namespace': t('Can add namespace'),
            'galaxy.change_namespace': t('Can change namespace'),
            'galaxy.delete_namespace': t('Can delete namespace'),
            'galaxy.view_namespace': t('Can view namespace'),
            'galaxy.manage_roles_task': t('Can manage task roles'),
            'galaxy.add_task': t('Can add task'),
            'galaxy.change_task': t('Can change task'),
            'galaxy.delete_task': t('Can delete task'),
            'galaxy.view_task': t('Can view task'),
            'shared.view_team': t('Can view team'),
          },
        },
      },
    }),
    [t]
  );
}
