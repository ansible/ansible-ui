export type Assignment = {
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
  };
  object_id: string;
  content_type: string;
};
