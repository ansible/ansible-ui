// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 1:33:34 PM
/* eslint-disable @typescript-eslint/no-empty-interface */
// /api/v3/tasks/{pulp_id}/
export interface TaskResponse {
  pulp_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  finished_at: string;
  started_at: string;
  state: string;
  parent_task: string;
}
