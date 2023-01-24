import { User as SwaggerUser } from './generated-from-swagger/api';

export interface User extends Omit<SwaggerUser, 'id' | 'username' | 'summary_fields'> {
  id: number;
  username: string;
  summary_fields: {
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
    indirect_access?: {
      descendant_roles: string[];
      role: {
        id: number;
        name: string;
        description: string;
        user_capabilities: {
          unattach: boolean;
        };
      };
    }[];
  };
}

export interface activeUser {
  results: User[];
}
