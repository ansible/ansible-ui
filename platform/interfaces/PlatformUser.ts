// import { User as SwaggerUser } from './generated-from-swagger/api';

export interface PlatformUser {
  id: number;
  url: string;
  created: string;
  created_by: string;
  modified: string;
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
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  password?: string;
  is_superuser?: boolean | null;
  is_platform_auditor?: boolean;
  last_login_map_results: [];
  last_login?: string | null;
  managed: boolean;
}
