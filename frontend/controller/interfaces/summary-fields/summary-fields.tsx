export interface SummaryFieldsOrganization {
  id: number;
  name: string;
  description: string;
}

export interface SummaryFieldsByUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface SummeryFieldObjectRole {
  description: string;
  name: string;
  id: number;
  user_only?: boolean;
}

export interface SummaryFieldsExecutionEnvironment {
  id: number;
  name: string;
  description: string;
  image: string;
}
