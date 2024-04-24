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
    content_object: {
      name: string;
      id: number;
    };
  };
  object_id: string;
  content_type: string;
};
