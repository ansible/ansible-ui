import { StatusEnum } from './generated/eda-api';

/** Serializer for the Activation Instance model. */
export interface EventStreamInstance {
  id: number;
  name?: string;
  /**
   * * `starting` - starting
   * * `running` - running
   * * `pending` - pending
   * * `failed` - failed
   * * `stopping` - stopping
   * * `stopped` - stopped
   * * `deleting` - deleting
   * * `completed` - completed
   * * `unresponsive` - unresponsive
   * * `error` - error
   */
  status?: StatusEnum;
  git_hash?: string;
  status_message?: string | null;
  event_stream_id?: string;
  /** @format date-time */
  started_at: string;
  /** @format date-time */
  ended_at: string | null;
}

export type EdaEventStreamInstance = EventStreamInstance;
