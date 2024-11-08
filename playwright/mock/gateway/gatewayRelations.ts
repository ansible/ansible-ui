/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function gatewayRelations(item: Record<string, any>) {
  if (!item) return;
  if (!item.summary_fields) {
    item.summary_fields = {};
  }
  if (!item.summary_fields.user_capabilities) {
    item.summary_fields.user_capabilities = {
      edit: true,
      delete: true,
      start: true,
      schedule: true,
      copy: true,
    };
  }
  if (!item.summary_fields.resource) {
    // TODO ----> This is a temporary solution to avoid errors in the tests
    // Really when creating the organization, the ansible_id should be set to a valid value
    item.summary_fields.resource = {
      ansible_id: '1234',
    };
  }
}
