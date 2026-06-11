export type ResourceType = {
  type?: string | undefined;
  summary_fields: {
    object_roles: {
      member_role: { id: number };
    };
    user_capabilities: {
      edit: boolean;
    };
  };
};
