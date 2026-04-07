import { ActivationCreate, ActivationRead, ProjectRef, StatusEnum } from './generated/eda-api';
export type EdaRulebookActivation = Omit<ActivationRead, 'project'> & {
  project: ProjectRef & { update_revision_on_launch: boolean };
  project_id: number;
  restart_on_project_update: boolean;
};
export type EdaRulebookActivationCreate = ActivationCreate;
export type EdaRulebookActivationStatus = StatusEnum;
