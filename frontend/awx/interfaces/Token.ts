export interface Token {
  id: number;
  type: 'o_auth2_access_token' | 'Access Token';
  url: string;
  summary_fields: {
    user: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    application: {
      id: number;
      name: string;
    };
  };
  created: string;
  modified: string;
  description: string;
  user: number;
  application: number;
  expires: string;
  scope: string;
}
