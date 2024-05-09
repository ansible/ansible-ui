export interface PlatformOrganization {
  name: string;
  description: string;
  id: number;
  url: string;
  created_on: string;
  created_by: string;
  modified_on: string;
  modified_by: string;
  related: {
    created_by: string;
    modified_by: string;
    teams: string;
  };
  summary_fields: {
    resource?: {
      ansible_id: string;
      resource_type: 'shared.organization';
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
  environment: number;
}
