import { Source } from './generated/eda-api';
export type EdaSource = Source;

export type EdaSourceEventMapping = {
  source_name: string;
  event_stream_id: string;
  event_stream_name: string;
  rulebook_hash: string;
};
