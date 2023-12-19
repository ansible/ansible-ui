export interface Application {
  id: number;
  name: string;
  description?: string;
  url: string;
  client_type: 'confidential' | 'public';
  redirect_uris?: string;
  organization: number;
  type: 'o_auth2_application';
  created: string;
  modified: string;
  client_id?: string;
  client_secret?: string;
  authorization_grant_type?: string;
  skip_authorization?: boolean;
  summary_fields: {
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
    organization: {
      id: number;
      name: string;
      description: string;
    };
    tokens?: {
      count: number;
      results: { id: number; token: string; scope: string }[];
    };
  };
}
