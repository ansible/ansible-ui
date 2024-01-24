import { Group } from './generated-from-swagger/api';

export interface AwxGroup extends Omit<Group, 'id' | 'name' | 'summary_fields' | 'related'> {
  id: number;
  name: string;
  created: string;
  modified: string;
  summary_fields: {
    groups: { results: never[]; count: number };
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
  };
  related: {
    children: {
      count: number;
      results: Array<{ id: number; name: string }>;
    };
    hosts: {
      count: number;
      results: Array<{ id: number; name: string }>;
    };
  };
}
