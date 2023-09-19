// Autogenerated file. Please do not modify.

// If you want to modify fields to interface, create new one in the folder above and create interface with the same name.
// You can then add, modify or even delete existing interface fields. Delete is done with Omit, note however it returns new interface.
// Those autogenerated interfaces does not contains all types, some of them are unknown - those are candidates for custom modification.
// See readme in folder above for more information.

/* eslint-disable @typescript-eslint/no-empty-interface */

// URL of interface:
// /api/v3/tasks/
// Part of response collection HubItemsResponse

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
