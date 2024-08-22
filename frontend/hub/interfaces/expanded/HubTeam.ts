export type HubTeam = {
  id: number;
  name: string;
  group: {
    id: number;
    name: string;
  };
  organization: {
    id: number;
    name: string;
  };
  resource: {
    resource_type: string;
    ansible_id: string;
  };
};
