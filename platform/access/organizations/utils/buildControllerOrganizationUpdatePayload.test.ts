import { describe, expect, it } from 'vitest';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { OrganizationWizardFormValues } from '../components/PlatformOrganizationForm';
import { buildControllerOrganizationUpdatePayload } from './buildControllerOrganizationUpdatePayload';

function makeValues(
  overrides: Partial<OrganizationWizardFormValues> & {
    organization?: Partial<PlatformOrganization>;
  } = {}
): OrganizationWizardFormValues {
  const organization: PlatformOrganization = {
    id: 1,
    name: 'Org',
    description: 'Desc',
    summary_fields: {},
    ...overrides.organization,
  } as PlatformOrganization;

  return {
    organization,
    opa_query_path: 'test/policy',
    maxHosts: 10,
    executionEnvironment: 5,
    ...overrides,
  };
}

describe('buildControllerOrganizationUpdatePayload', () => {
  it('should include gateway name and description on the controller payload', () => {
    const payload = buildControllerOrganizationUpdatePayload(
      makeValues({
        organization: { name: 'Renamed', description: 'New description' },
      })
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
    const payload = buildControllerOrganizationUpdatePayload(
      makeValues({
        organization: { description: undefined },
      })
    );

    expect(payload.description).toBe('');
  });

  it('should default max_hosts to zero when maxHosts is unset', () => {
    const payload = buildControllerOrganizationUpdatePayload(
      makeValues({
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
