import { RoleDefinition } from './generated/eda-api';

// extend the interface with additional properties
export interface EdaRbacRole extends Omit<RoleDefinition, 'summary_fields'> {
  summary_fields: {
    created_by?: {
      id: number;
      username: string;
    };
    modified_by?: {
      id: number;
      username: string;
    };
  };
}

/*export interface EdaRbacRole {
  id: number;
  url: string;
  related: {
    team_assignments: string;
    user_assignments: string;
  };
  summary_fields: {
    [key: string]: Record<string, string>[] | undefined;
  };
  permissions: string[];
  content_type: string;
  created: string;
  modified: string;
  name: string;
  description: string;
  managed: boolean;
  created_by: string | null;
  modified_by: string | null;
}*/
