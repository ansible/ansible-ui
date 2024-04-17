import { Assignment } from './Assignment';

export type TeamAssignment = Assignment & {
  summary_fields: {
    team: {
      id: number;
      name: string;
    };
  };
};
