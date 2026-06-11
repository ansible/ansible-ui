export type UserRoleAccess = {
  id: string;
  url: string;
  related: {
    details: string;
  };
  username: string;
  is_superuser: boolean;
  object_role_assignments:
    | [
        {
          type: string;
          role_definition: {
            name: string;
            url: string;
          };
        },
      ]
    | [];
  first_name: string;
  last_name: string;
};
