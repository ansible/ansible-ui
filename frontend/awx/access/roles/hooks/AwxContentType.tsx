import { SharedContentType } from '@ansible/common-ui/access/roles/SharedContentType';

export enum AwxContentType {
  Credential = 'awx.credential',
  ExecutionEnvironement = 'awx.executionenvironment',
  InstanceGroup = 'awx.instancegroup',
  Inventory = 'awx.inventory',
  JobTemplate = 'awx.jobtemplate',
  NotificationTemplate = 'awx.notificationtemplate',
  Project = 'awx.project',
  WorkflowJobTemplate = 'awx.workflowjobtemplate',
  Organization = SharedContentType.Organization,
  Team = SharedContentType.Team,
}
