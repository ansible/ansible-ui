import { Assignment } from './Assignment';

export type TeamAssignment = Assignment & {
  team?: number;
  summary_fields: {
    team: {
      id: number;
      name: string;
    };
  };
};
