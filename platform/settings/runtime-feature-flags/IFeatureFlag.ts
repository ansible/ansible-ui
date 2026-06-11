export type SupportLevel = 'TECHNOLOGY_PREVIEW' | 'DEVELOPER_PREVIEW';
export type ToggleType = 'run-time' | 'install-time';

export interface IFeatureFlag {
  id: number;
  url: string;
  related: {
    activity_stream: string;
    created_by: string;
    modified_by: string;
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
  created: string;
  created_by: number;
  modified: string;
  modified_by: number;
  name: string;
  ui_name: string;
  condition: string;
  value: string;
  required: boolean;
  support_level: SupportLevel;
  visibility: boolean;
  toggle_type: ToggleType;
  description: string;
  support_url: string;
  labels: string[];
  state: boolean;
}
