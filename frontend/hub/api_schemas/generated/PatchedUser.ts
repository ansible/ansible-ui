// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 12:14:22 PM
export interface PatchedUser {
  // Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  // The groups this user belongs to. A user will get all permissions granted to each of their groups.
  password: string;
  // Designates that this user has all permissions without explicitly assigning them.
  is_superuser: boolean;
}
