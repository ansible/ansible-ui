export interface PlatformTeam {
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
    organization: string;
  };
  summary_fields: {
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
    organization: {
      id: number;
      name: string;
    };
  };
  organization: number;
  users: number[];
}
