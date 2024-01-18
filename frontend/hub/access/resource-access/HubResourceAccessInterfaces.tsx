export interface ResourceAccessUser {
  username: string;
  object_roles: string[];
}

export interface ResourceAccessTeam {
  id: number;
  name: string;
  object_roles: string[];
}
