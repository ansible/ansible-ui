import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetActivityStreamRoute } from './useGetActivityStreamRoute';

function renderActivityStreamRoute(resource?: string | null) {
  return renderHook(() => useGetActivityStreamRoute(resource));
}

const ACTIVITY_STREAM_ROUTE_MAPPINGS: {
  resource: string | null;
  expected: AwxRoute | null;
  description: string;
}[] = [
  { resource: null, expected: null, description: 'null resource' },
  { resource: '', expected: null, description: 'empty resource' },
  { resource: 'job', expected: AwxRoute.JobOutput, description: 'job' },
  { resource: 'workflow_job', expected: AwxRoute.JobOutput, description: 'workflow_job' },
  {
    resource: 'job_template',
    expected: AwxRoute.JobTemplateDetails,
    description: 'job_template',
  },
  {
    resource: 'workflow_job_template',
    expected: AwxRoute.WorkflowJobTemplateDetails,
    description: 'workflow_job_template',
  },
  { resource: 'project', expected: AwxRoute.ProjectDetails, description: 'project' },
  { resource: 'inventory', expected: AwxRoute.InventoryDetails, description: 'inventory' },
  {
    resource: 'inventory_source',
    expected: AwxRoute.InventorySourceDetail,
    description: 'inventory_source',
  },
  { resource: 'host', expected: AwxRoute.HostDetails, description: 'host' },
  {
    resource: 'instance_group',
    expected: AwxRoute.InstanceGroupDetails,
    description: 'instance_group',
  },
  { resource: 'instance', expected: AwxRoute.InstanceDetails, description: 'instance' },
  {
    resource: 'execution_environment',
    expected: AwxRoute.ExecutionEnvironmentDetails,
    description: 'execution_environment',
  },
  {
    resource: 'workflow_approval',
    expected: AwxRoute.WorkflowApprovalDetails,
    description: 'workflow_approval',
  },
  {
    resource: 'management_job',
    expected: AwxRoute.ManagementJobSchedules,
    description: 'management_job',
  },
  {
    resource: 'organization',
    expected: AwxRoute.OrganizationDetails,
    description: 'organization',
  },
  { resource: 'team', expected: AwxRoute.TeamDetails, description: 'team' },
  { resource: 'user', expected: AwxRoute.UserDetails, description: 'user' },
  { resource: 'role', expected: AwxRoute.RoleDetails, description: 'role' },
  { resource: 'credential', expected: AwxRoute.CredentialDetails, description: 'credential' },
  {
    resource: 'credential_type',
    expected: AwxRoute.CredentialTypeDetails,
    description: 'credential_type',
  },
  { resource: 'schedule', expected: null, description: 'unmapped schedule' },
  {
    resource: 'custom_inventory_script',
    expected: null,
    description: 'unmapped custom_inventory_script',
  },
  { resource: 'job_notification', expected: null, description: 'unmapped job_notification' },
  { resource: 'setting', expected: null, description: 'unmapped setting' },
  { resource: 'unknown_resource', expected: null, description: 'unknown resource' },
];

describe('useGetActivityStreamRoute', () => {
  test('returns null when resource is omitted', () => {
    expect(renderActivityStreamRoute().result.current).toBeNull();
  });

  test.each(ACTIVITY_STREAM_ROUTE_MAPPINGS)(
    'maps $description to the expected route',
    ({ resource, expected }) => {
      expect(renderActivityStreamRoute(resource).result.current).toBe(expected);
    }
  );
});
