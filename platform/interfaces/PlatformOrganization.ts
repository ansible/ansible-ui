export interface PlatformOrganization {
  name: string;
  description: string;
  id: number;
  url: string;
  created: string;
  created_by: number;
  modified: string;
  modified_by: number;
  related: {
    created_by: string;
    modified_by: string;
    teams: string;
  };
  summary_fields: {
    resource?: {
      ansible_id: string;
      resource_type: string;
    };
    created_by: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    modified_by: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    related_field_counts?: {
      teams?: number;
      users?: number;
    };
  };
  managed: boolean;
}
