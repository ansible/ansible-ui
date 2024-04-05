export interface EdaRbacRole {
  id: number;
  url: string;
  related: {
    team_assignments: string;
    user_assignments: string;
  };
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
  permissions: string[];
  content_type: string;
  created: string;
  modified: string;
  name: string;
  description: string;
  managed: boolean;
  created_by: number | null;
  modified_by: number | null;
}
