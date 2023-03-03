export interface ExecutionEnvironment {
  id: number;
  type: string;
  url: string;
  related: {
    named_url: string;
    activity_stream: string;
    unified_job_templates: string;
    copy: string;
  };
  summary_fields: {
    user_capabilities: {
      edit: boolean;
      delete: boolean;
      copy: boolean;
    };
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
  created: string;
  modified: string;
  name: string;
  description: string;
  organization: number;
  image: string;
  managed: boolean;
  credential: number;
  pull: string;
}
