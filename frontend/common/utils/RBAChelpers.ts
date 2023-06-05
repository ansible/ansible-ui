type ResourceRBAC = {
  summary_fields: { user_capabilities: { edit: boolean; delete: boolean } };
};

export const cannotEditResource = (
  resource: ResourceRBAC,
  t: (string: string) => string,
  canCreateResource?: boolean
) =>
  resource?.summary_fields?.user_capabilities?.edit || canCreateResource
    ? ''
    : t(`This cannot be edited due to insufficient permissions.`);

export function cannotDeleteResource(resource: ResourceRBAC, t: (string: string) => string) {
  if (resource.summary_fields.user_capabilities.delete) {
    return '';
  }
  return t(`This cannot be deleted due to insufficient permissions.`);
}
