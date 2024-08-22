import { Source } from './generated/eda-api';
export type EdaSource = Source;

export type EdaSourceEventMapping = {
  source_name: string;
  webhook_id: string;
  webhook_name: string;
  rulebook_hash: string;
};
