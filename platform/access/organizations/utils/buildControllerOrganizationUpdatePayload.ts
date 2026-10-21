import { OrganizationWizardFormValues } from '../components/PlatformOrganizationForm';

export function buildControllerOrganizationUpdatePayload(values: OrganizationWizardFormValues) {
  return {
    name: values.organization.name,
    description: values.organization.description ?? '',
    opa_query_path: values?.opa_query_path ?? null,
    default_environment: values?.executionEnvironment ?? null,
    max_hosts: values?.maxHosts ? values.maxHosts : 0,
  };
}
