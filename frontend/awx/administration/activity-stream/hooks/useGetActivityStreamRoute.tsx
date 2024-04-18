import { AwxRoute } from '../../../main/AwxRoutes';

export function useGetActivityStreamRoute(resource?: string | null): AwxRoute | null {
  if (!resource) {
    return null;
  }
  switch (resource) {
    case 'job':
    case 'workflow_job':
      return AwxRoute.JobOutput;
    case 'job_template':
      return AwxRoute.JobTemplateDetails;
    case 'workflow_job_template':
      return AwxRoute.WorkflowJobTemplateDetails;
    case 'project':
      return AwxRoute.ProjectDetails;
    case 'inventory':
      // TODO add smart and constructed inventory routes
      return AwxRoute.InventoryDetails;
    case 'inventory_source':
      return AwxRoute.InventorySourceDetail;
    case 'host':
      return AwxRoute.HostDetails;
    case 'instance_group':
      return AwxRoute.InstanceGroupDetails;
    case 'instance':
      return AwxRoute.InstanceDetails;
    case 'execution_environment':
      return AwxRoute.ExecutionEnvironmentDetails;
    case 'workflow_approval':
      return AwxRoute.WorkflowApprovalDetails;
    case 'management_job':
      return AwxRoute.ManagementJobDetails;
    case 'o_auth2_application':
      return AwxRoute.ApplicationDetails;
    case 'organization':
      return AwxRoute.OrganizationDetails;
    case 'team':
      return AwxRoute.TeamDetails;
    case 'user':
      return AwxRoute.UserDetails;
    case 'role':
      return AwxRoute.RoleDetails;
    case 'credential':
      return AwxRoute.CredentialDetails;
    case 'credential_type':
      return AwxRoute.CredentialTypeDetails;
    /* Routes missing */
    // case 'schedule':
    //   return;
    // case 'custom_inventory_script':
    //   return;
    // case 'job_notification':
    //   return;
    // case 'setting':
    //   return;
    default:
      return null;
  }
}
