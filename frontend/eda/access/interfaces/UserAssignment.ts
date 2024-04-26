import { Assignment } from './Assignment';

export type UserAssignment = Assignment & {
  summary_fields: {
    user: {
      id: number;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
    };
  };
};
