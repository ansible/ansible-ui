import { describe, expect, it } from 'vitest';
import {
  orgTeamRoleAssignmentsUrl,
  ROLE_TEAM_ASSIGNMENTS_CACHE_KEY,
} from './orgTeamRoleAssignmentsUrl';

describe('orgTeamRoleAssignmentsUrl', () => {
  it('builds the organization-scoped assignment URL', () => {
    expect(orgTeamRoleAssignmentsUrl(42)).toContain(
      '/role_team_assignments/?object_id=42&content_type__api_slug=shared.organization'
    );
  });

  it('provides the assignment collection cache key', () => {
    expect(ROLE_TEAM_ASSIGNMENTS_CACHE_KEY).toContain('/role_team_assignments/');
  });
});
