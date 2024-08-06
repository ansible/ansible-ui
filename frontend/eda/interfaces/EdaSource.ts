//import { Source } from './generated/eda-api';
export type EdaSource = {
  name: string;
  source_info: string;
  rulebook_hash: string;
};

export type EdaSourceEventMapping = {
  source_name: string;
  webhook_id: string;
  webhook_name: string;
  rulebook_hash: string;
};
