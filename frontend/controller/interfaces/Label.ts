export interface Label {
  id: number;
  name: string;
  organization: number;
  type: string;
  url: string;
  created: string;
  modeified: string;
  summary_fields: {
    created_by: { username: string; first_name: string; last_name: string; id: number };
    modified_by: { username: string; first_name: string; last_name: string; id: number };
    organization: { id: number; name: string; description: string };
  };
}
