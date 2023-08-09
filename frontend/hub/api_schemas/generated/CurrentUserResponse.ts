// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 1:33:34 PM
/* eslint-disable @typescript-eslint/no-empty-interface */
// /api/_ui/v1/me/
export interface CurrentUserResponse {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  // The groups this user belongs to. A user will get all permissions granted to each of their groups.
  date_joined: string;
  is_superuser: boolean;
  auth_provider: string;
  is_anonymous: string;
}
