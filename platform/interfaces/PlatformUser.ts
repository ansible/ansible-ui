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
  summary_fields: object; // TODO: This will be updated as +the API is fleshed out further
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  is_superuser: boolean;
  is_system_auditor?: boolean; // This will eventually be removed from the API
  last_login_map_results: [];
  last_login: string;
  organizations: number[];
}
