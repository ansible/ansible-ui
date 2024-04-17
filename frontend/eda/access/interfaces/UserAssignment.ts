import { Assignment } from './Assignment';

export type UserAssignment = Assignment & {
  user?: number;
  summary_fields: {
    user: {
      id: number;
      username: string;
    };
  };
};
