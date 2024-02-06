import { User } from '../generated/User';

export interface HubUser extends User {
  id: number;
  groups: string[];
}
