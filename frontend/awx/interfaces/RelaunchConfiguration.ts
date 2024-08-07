export type AdHocCommandRelaunch = object;

export type WorkflowJobRelaunch = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in any]: never;
};

export interface JobRelaunch {
  /** Passwords needed to start */
  passwords_needed_to_start?: string;
  /** Retry counts */
  retry_counts?: string;
  /**
   * Hosts
   * @default "all"
   */
  hosts?: 'all' | 'failed' | null;
  /** Credential passwords */
  credential_passwords?: string;
  job_type?: 'run' | 'check' | null;
}

export interface InventorySourceUpdate {
  /** Can update */
  can_update?: boolean;
}

export interface ProjectUpdateView {
  /** Can update */
  can_update?: boolean;
}
