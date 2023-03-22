import { User as SwaggerUser } from './generated-from-swagger/api';
import { SummaryFieldsOrganization } from './summary-fields/summary-fields';

export type AccessRole = {
  id: number;
  name: string;
  resource_name: string;
  resource_type: string;
  related: {
    [key: string]: string;
  };
  team_id: number;
  team_name: string;
  team_organization_name: string;
  description: string;
  user_capabilities: {
    unattach: boolean;
  };
};
export interface User extends Omit<SwaggerUser, 'id' | 'username' | 'summary_fields'> {
  id: number;
  username: string;
  user_type?: 'normal' | 'administrator' | 'auditor';
  disassociate?: boolean;
  organization?: number;
  summary_fields: {
    organization: SummaryFieldsOrganization;
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
    indirect_access?: {
      descendant_roles: string[];
      role: AccessRole;
    }[];
    direct_access?: {
      descendant_roles: string[];
      role: AccessRole;
    }[];
  };
  user_roles?: AccessRole[];
  team_roles?: AccessRole[];
  auth: string[];
}
