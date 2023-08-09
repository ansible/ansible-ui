// Autogenerated file. Please do not modify.
// If you want to add new fields to interface, create new one in the folder above and extends this interface.
// Modified at 8/9/2023, 1:33:34 PM
/* eslint-disable @typescript-eslint/no-empty-interface */
// /api/v3/tasks/
// Part of response collection PaginatedTaskSummaryResponseList
/*
TaskSerializer but without detail fields.

For use in /tasks/<str:pk>/ detail views.
*/
export interface TaskSummaryResponse {
  pulp_id: string;
  name: string;
  state: string;
  started_at: string;
  finished_at: string;
  href: string;
}
