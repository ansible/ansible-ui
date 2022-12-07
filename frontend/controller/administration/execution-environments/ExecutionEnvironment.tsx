export interface ExecutionEnvironment {
  type: 'execution_environment';
  id: number;
  name: string;
  description?: string;
  created: string;
  modified: string;
  credential: string | null;
  image?: string;
  managed?: boolean;
  organization: number | null;
  summary_fields?: {
    organization?: {
      id: number;
      name: string;
    };
    created_by?: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    modified_by?: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
  };
}
