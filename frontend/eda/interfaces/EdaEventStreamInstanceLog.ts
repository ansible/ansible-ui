export type EdaEventStreamInstanceLog = EventStreamInstanceLog;
/** Serializer for the Activation Instance Log model. */
export interface EventStreamInstanceLog {
  id: number;
  /**
   * @min -2147483648
   * @max 2147483647
   */
  line_number: number;
  log: string;
  event_stream_instance: number;
}
