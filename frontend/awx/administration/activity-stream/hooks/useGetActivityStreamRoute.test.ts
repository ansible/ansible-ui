import { describe, expect, test } from 'vitest';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetActivityStreamRoute } from './useGetActivityStreamRoute';

describe('useGetActivityStreamRoute', () => {
  test('returns null when resource is missing', () => {
    expect(useGetActivityStreamRoute(null)).toBeNull();
    expect(useGetActivityStreamRoute(undefined)).toBeNull();
    expect(useGetActivityStreamRoute('')).toBeNull();
  });

  test('maps known activity stream resources to detail routes', () => {
    expect(useGetActivityStreamRoute('job')).toBe(AwxRoute.JobOutput);
    expect(useGetActivityStreamRoute('workflow_job')).toBe(AwxRoute.JobOutput);
    expect(useGetActivityStreamRoute('job_template')).toBe(AwxRoute.JobTemplateDetails);
    expect(useGetActivityStreamRoute('project')).toBe(AwxRoute.ProjectDetails);
    expect(useGetActivityStreamRoute('inventory')).toBe(AwxRoute.InventoryDetails);
    expect(useGetActivityStreamRoute('host')).toBe(AwxRoute.HostDetails);
    expect(useGetActivityStreamRoute('credential')).toBe(AwxRoute.CredentialDetails);
    expect(useGetActivityStreamRoute('user')).toBe(AwxRoute.UserDetails);
  });

  test('returns null for unsupported resources', () => {
    expect(useGetActivityStreamRoute('schedule')).toBeNull();
    expect(useGetActivityStreamRoute('unknown_resource')).toBeNull();
  });
});
