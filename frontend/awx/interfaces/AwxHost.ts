import { Host } from './generated-from-swagger/api';

export interface AwxHost
  extends Omit<
    Host,
    | 'id'
    | 'name'
    | 'summary_fields'
    | 'managed'
    | 'kubernetes'
    | 'organization'
    | 'cloud'
    | 'description'
    | 'related'
  > {
  description?: string;
  id: number;
  name: string;
  created: string;
  modified: string;
  summary_fields: {
    groups: {
      count: number;
      results: Array<{ id: number; name: string }>;
    };
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
  };
}
