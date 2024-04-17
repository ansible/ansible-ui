export type Assignment = {
  id: number;
  object_id?: string;
  role_definition: number;
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
  };
};
