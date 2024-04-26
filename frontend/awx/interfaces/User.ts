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
export interface AwxUser
  extends Omit<SwaggerUser, 'id' | 'username' | 'summary_fields' | 'related'> {
  id: number;
  username: string;
  user_type?: 'normal' | 'administrator' | 'auditor';
  disassociate?: boolean;
  organization?: number;
  related?: Partial<{
    named_url: string;
    teams: string;
    organizations: string;
    admin_of_organizations: string;
    projects: string;
    credentials: string;
    roles: string;
    activity_stream: string;
    access_list: string;
    tokens: string;
    authorized_tokens: string;
    personal_tokens: string;
  }>;
  summary_fields: {
    resource: {
      ansible_id: string;
      resource_type: 'shared.user';
    };
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
