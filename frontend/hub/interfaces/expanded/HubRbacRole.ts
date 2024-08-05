import { ContentTypeEnum } from './ContentType';

export interface HubRbacRole {
  id: number;
  url: string;
  related: {
    team_assignments: string;
    user_assignments: string;
  };
  summary_fields: {
    [key: string]: Record<string, string>[] | undefined;
  };
  permissions: string[];
  content_type: ContentTypeEnum | null;
  created: string;
  modified: string;
  name: string;
  description: string;
  managed: boolean;
  created_by: string | null;
  modified_by: string | null;
}
