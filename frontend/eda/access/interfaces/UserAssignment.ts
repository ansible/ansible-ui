export type UserAssignment = {
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
    user: {
      id: number;
      username: string;
    };
  };
};
