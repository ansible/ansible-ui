export interface HubResourceAccessUser {
  username: string;
  object_roles: string[];
}

export interface HubResourceAccessTeam {
  id: number;
  name: string;
  object_roles: string[];
}

export interface PropsForHubRoleListForUser {
  user: HubResourceAccessUser;
  team?: never;
  canEditAccess: boolean;
}

export interface PropsForHubRoleListForTeam {
  user?: never;
  team: HubResourceAccessTeam;
  canEditAccess: boolean;
}

export interface HubAccessRole {
  name: string;
}
