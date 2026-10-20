import { describe, expect, it } from 'vitest';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { OrganizationWizardFormValues } from '../components/PlatformOrganizationForm';
import { buildControllerOrganizationUpdatePayload } from './buildControllerOrganizationUpdatePayload';

const baseOrganization = {
  id: 1,
  name: 'Org',
  description: 'Desc',
  summary_fields: {
    created_by: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    },
    modified_by: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    },
  },
  managed: false,
} as PlatformOrganization;

function makeValues(
  organizationPatch?: Partial<PlatformOrganization>,
  valuesPatch?: Partial<Omit<OrganizationWizardFormValues, 'organization'>>
): OrganizationWizardFormValues {
  return {
    organization: { ...baseOrganization, ...organizationPatch },
    opa_query_path: 'test/policy',
    maxHosts: 10,
    executionEnvironment: 5,
    ...valuesPatch,
  };
}

describe('buildControllerOrganizationUpdatePayload', () => {
  it('should include gateway name and description on the controller payload', () => {
    const payload = buildControllerOrganizationUpdatePayload(
      makeValues({ name: 'Renamed', description: 'New description' })
    );

    expect(payload).toEqual({
      name: 'Renamed',
      description: 'New description',
      opa_query_path: 'test/policy',
      default_environment: 5,
      max_hosts: 10,
    });
  });

  it('should default missing description to an empty string', () => {
    const organization = { ...baseOrganization };
    delete (organization as Partial<PlatformOrganization>).description;

    const payload = buildControllerOrganizationUpdatePayload({
      organization: organization as PlatformOrganization,
      opa_query_path: 'test/policy',
      maxHosts: 10,
      executionEnvironment: 5,
    });

    expect(payload.description).toBe('');
  });

  it('should default max_hosts to zero when maxHosts is unset', () => {
    const payload = buildControllerOrganizationUpdatePayload(
      makeValues(undefined, {
        maxHosts: undefined,
        opa_query_path: undefined,
        executionEnvironment: undefined,
      })
    );

    expect(payload).toMatchObject({
      opa_query_path: null,
      default_environment: null,
      max_hosts: 0,
    });
  });
});
