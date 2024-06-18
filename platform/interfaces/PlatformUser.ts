// import { User as SwaggerUser } from './generated-from-swagger/api';

export interface PlatformUser {
  id: number;
  url: string;
  created_on: string;
  created_by: string;
  modified_on: string;
  modified_by: string;
  related: {
    [key: string]: string;
  };
  summary_fields: {
    modified_by: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    created_by: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    resource: {
      ansible_id: string;
      resource_type: string;
    };
  };
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  is_superuser: boolean;
  is_platform_auditor?: boolean;
  last_login_map_results: [];
  last_login: string;
  managed: boolean;
}
