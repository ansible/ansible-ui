import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type AwxRoleMetadaContentType = {
  displayName: string;
  permissions: {
    [key: string]: string;
  };
};

export enum AwxContentTypes {
  Credential = 'awx.credential',
  ExecutionEnvironement = 'awx.executionenvironment',
  InstanceGroup = 'awx.instancegroup',
  Inventory = 'awx.inventory',
  JobTemplate = 'awx.jobtemplate',
  NotificationTemplate = 'awx.notificationtemplate',
  Organization = 'shared.organization',
  Project = 'awx.project',
  Team = 'shared.team',
  WorkflowJobTemplate = 'awx.workflowjobtemplate',
}

export interface AwxRoleMetadata {
  content_types: Record<AwxContentTypes, AwxRoleMetadaContentType>;
}

export function useAwxRoleMetadata(): AwxRoleMetadata {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      content_types: {
        'awx.credential': {
          displayName: t('Credential'),
          permissions: {
            'awx.use_credential': t('Use credential'),
            'awx.change_credential': t('Change credential'),
            'awx.delete_credential': t('Delete credential'),
            'awx.view_credential': t('View credential'),
          },
        },
        'awx.executionenvironment': {
          displayName: t('Execution environment'),
          permissions: {
            'awx.change_executionenvironment': t('Change execution environment'),
            'awx.delete_executionenvironment': t('Delete execution environment'),
            'awx.view_executionenvironment': t('View execution environment'),
          },
        },
        'awx.instancegroup': {
          displayName: t('Instance group'),
          permissions: {
            'awx.use_instancegroup': t('Use instance group'),
            'awx.change_instancegroup': t('Change instance group'),
            'awx.delete_instancegroup': t('Delete instance group'),
            'awx.view_instancegroup': t('View instance group'),
          },
        },
        'awx.inventory': {
          displayName: t('Inventory'),
          permissions: {
            'awx.use_inventory': t('Use inventory'),
            'awx.adhoc_inventory': t('Ad hoc inventory'),
            'awx.update_inventory': t('Update inventory'),
            'awx.change_inventory': t('Change inventory'),
            'awx.delete_inventory': t('Delete inventory'),
            'awx.view_inventory': t('View inventory'),
          },
        },
        'awx.jobtemplate': {
          displayName: t('Job template'),
          permissions: {
            'awx.execute_jobtemplate': t('Execute job template'),
            'awx.change_jobtemplate': t('Change job template'),
            'awx.delete_jobtemplate': t('Delete job template'),
            'awx.view_jobtemplate': t('View job template'),
          },
        },
        'awx.notificationtemplate': {
          displayName: t('Notification template'),
          permissions: {
            'awx.change_notificationtemplate': t('Change notification template'),
            'awx.delete_notificationtemplate': t('Delete notification template'),
            'awx.view_notificationtemplate': t('View notification template'),
          },
        },
        'shared.organization': {
          displayName: t('Organization'),
          permissions: {
            'shared.member_organization': t('Member organization'),
            'shared.audit_organization': t('Audit organization'),
            'shared.change_organization': t('Change organization'),
            'shared.delete_organization': t('Delete organization'),
            'shared.view_organization': t('View organization'),
            'awx.update_project': t('Update project'),
            'awx.use_project': t('Use project'),
            'awx.add_project': t('Add project'),
            'awx.change_project': t('Change project'),
            'awx.delete_project': t('Delete project'),
            'awx.view_project': t('View project'),
            'shared.member_team': t('Member team'),
            'shared.add_team': t('Add team'),
            'shared.change_team': t('Change team'),
            'shared.delete_team': t('Delete team'),
            'shared.view_team': t('View team'),
            'awx.execute_workflowjobtemplate': t('Execute workflow job template'),
            'awx.approve_workflowjobtemplate': t('Approve workflow job template'),
            'awx.add_workflowjobtemplate': t('Add workflow job template'),
            'awx.change_workflowjobtemplate': t('Change workflow job template'),
            'awx.delete_workflowjobtemplate': t('Delete workflow job template'),
            'awx.view_workflowjobtemplate': t('Delete workflow job template'),
            'awx.execute_jobtemplate': t('Execute job template'),
            'awx.change_jobtemplate': t('Change job template'),
            'awx.delete_jobtemplate': t('Delete job template'),
            'awx.view_jobtemplate': t('View job template'),
            'awx.use_inventory': t('Use inventory'),
            'awx.adhoc_inventory': t('Ad hoc inventory'),
            'awx.update_inventory': t('Update inventory'),
            'awx.add_inventory': t('Add inventory'),
            'awx.change_inventory': t('Change inventory'),
            'awx.delete_inventory': t('Delete inventory'),
            'awx.view_inventory': t('View inventory'),
            'awx.use_credential': t('Use credential'),
            'awx.add_credential': t('Add credential'),
            'awx.change_credential': t('Change credential'),
            'awx.delete_credential': t('Delete credential'),
            'awx.view_credential': t('View credential'),
            'awx.add_notificationtemplate': t('Create notification template'),
            'awx.change_notificationtemplate': t('Change notification template'),
            'awx.delete_notificationtemplate': t('Delete notification template'),
            'awx.view_notificationtemplate': t('View notification template'),
            'awx.add_executionenvironment': t('Add execution environment'),
            'awx.change_executionenvironment': t('Change execution environment'),
            'awx.delete_executionenvironment': t('Delete execution environment'),
            'awx.view_executionenvironment': t('View execution environment'),
          },
        },
        'awx.project': {
          displayName: t('Project'),
          permissions: {
            'awx.update_project': t('Update project'),
            'awx.use_project': t('Use project'),
            'awx.change_project': t('Change project'),
            'awx.delete_project': t('Delete project'),
            'awx.view_project': t('View project'),
          },
        },
        'shared.team': {
          displayName: t('Team'),
          permissions: {
            'shared.member_team': t('Member team'),
            'shared.change_team': t('Change team'),
            'shared.delete_team': t('Delete team'),
            'shared.view_team': t('View team'),
          },
        },
        'awx.workflowjobtemplate': {
          displayName: t('Workflow job template'),
          permissions: {
            'awx.execute_workflowjobtemplate': t('Execute workflow job template'),
            'awx.approve_workflowjobtemplate': t('Approve workflow job template'),
            'awx.change_workflowjobtemplate': t('Change workflow job template'),
            'awx.delete_workflowjobtemplate': t('Delete workflow job template'),
            'awx.view_workflowjobtemplate': t('View workflow job template'),
          },
        },
      },
    }),
    [t]
  );
}
