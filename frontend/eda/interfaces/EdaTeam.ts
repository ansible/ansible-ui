export interface EdaTeam {
  id: number;
  name: string;
  description: string;
  organization_id: number | null;
  created: string;
  created_by: string | null;
  modified: string;
  modified_by: string | null;
}
