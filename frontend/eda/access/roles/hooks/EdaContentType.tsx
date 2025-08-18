import { SharedContentType } from '@ansible/common-ui/access/roles/SharedContentType';

export enum EdaContentType {
  Activation = 'eda.activation',
  AuditRule = 'eda.auditrule',
  Credential = 'eda.edacredential',
  DecisionEnvironment = 'eda.decisionenvironment',
  EventStream = 'eda.eventstream',
  Project = 'eda.project',
  Rulebook = 'eda.rulebook',
  RulebookProcess = 'eda.rulebookprocess',
  Organization = SharedContentType.Organization,
  Team = SharedContentType.Team,
}
