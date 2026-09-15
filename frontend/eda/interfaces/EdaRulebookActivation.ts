import { ActivationCreate, ActivationRead, ProjectRef, StatusEnum } from './generated/eda-api';
import { EdaCredential } from './EdaCredential';

export type EdaRulebookActivation = Omit<ActivationRead, 'project'> & {
  project: ProjectRef & { update_revision_on_launch: boolean };
  project_id: number;
  restart_on_project_update: boolean;
  enable_persistence?: boolean;
  rule_engine_credential_id?: number | null;
  rule_engine_credential?: EdaCredential | null;
};
export type EdaRulebookActivationCreate = ActivationCreate & {
  enable_persistence?: boolean;
  rule_engine_credential_id?: number | null;
  store_debug_logs?: boolean;
};
export type EdaRulebookActivationStatus = StatusEnum;
