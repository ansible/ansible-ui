export type TeamAssignment = {
  id: number;
  summary_fields: {
    object_role: {
      id: number;
    };
    role_definition: {
      id: number;
      name: string;
      description: string;
      managed: boolean;
    };
    team: {
      id: number;
      name: string;
    };
  };
};
