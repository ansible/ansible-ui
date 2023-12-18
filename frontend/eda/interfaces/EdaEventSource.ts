export interface EdaEventSource {
  name: string;
  args: string | undefined;
  type: string;
  decision_environment_id: number | null;
  decision_environment_name: string;
  id: number;
  uuid: string;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
}

/** Serializer for creating the EventSource. */
export interface EdaEventSourceCreate {
  name: string;
  args: string;
  type: string;
  decision_environment_id: number | null;
}

/** Serializer for reading the EventSource with embedded objects. */
export interface EdaEventSourceRead {
  id: number;
  uuid: string;
  name: string;
  args?: string;
  type: string;
  decision_environment_id: number | null;
  decision_environment_name: string;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
}
