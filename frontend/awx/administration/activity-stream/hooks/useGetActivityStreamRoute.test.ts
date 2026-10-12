import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetActivityStreamRoute } from './useGetActivityStreamRoute';

function renderActivityStreamRoute(resource?: string | null) {
  return renderHook(() => useGetActivityStreamRoute(resource));
}

describe('useGetActivityStreamRoute', () => {
  test('returns null when resource is missing', () => {
    expect(renderActivityStreamRoute(null).result.current).toBeNull();
    expect(renderActivityStreamRoute().result.current).toBeNull();
    expect(renderActivityStreamRoute('').result.current).toBeNull();
  });

  test('maps known activity stream resources to detail routes', () => {
    expect(renderActivityStreamRoute('job').result.current).toBe(AwxRoute.JobOutput);
    expect(renderActivityStreamRoute('workflow_job').result.current).toBe(AwxRoute.JobOutput);
    expect(renderActivityStreamRoute('job_template').result.current).toBe(
      AwxRoute.JobTemplateDetails
    );
    expect(renderActivityStreamRoute('project').result.current).toBe(AwxRoute.ProjectDetails);
    expect(renderActivityStreamRoute('inventory').result.current).toBe(AwxRoute.InventoryDetails);
    expect(renderActivityStreamRoute('host').result.current).toBe(AwxRoute.HostDetails);
    expect(renderActivityStreamRoute('credential').result.current).toBe(AwxRoute.CredentialDetails);
    expect(renderActivityStreamRoute('user').result.current).toBe(AwxRoute.UserDetails);
  });

  test('returns null for unsupported resources', () => {
    expect(renderActivityStreamRoute('schedule').result.current).toBeNull();
    expect(renderActivityStreamRoute('unknown_resource').result.current).toBeNull();
  });
});
